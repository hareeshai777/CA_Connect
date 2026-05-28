import { asyncHandler } from "../utils/asyncHandler";
import { Router } from "express";
import { body } from "express-validator";
import * as bookingController from "../controllers/booking.controller";
import { authenticate, authorize } from "../middleware/auth";
import { format } from "date-fns";
import { validate } from "../middleware/validate";

const router = Router();

router.post(
  "/order",
  authenticate,
  authorize("CLIENT"),
  [
    body("caId").notEmpty(),
    body("serviceId").notEmpty(),
    body("slotId").notEmpty(),
  ],
  validate,
  asyncHandler(bookingController.createBookingOrder)
);

router.post(
  "/confirm",
  authenticate,
  authorize("CLIENT"),
  [
    body("razorpayOrderId").notEmpty(),
    body("razorpayPaymentId").notEmpty(),
    body("razorpaySignature").notEmpty(),
    body("caId").notEmpty(),
    body("serviceId").notEmpty(),
    body("slotId").notEmpty(),
  ],
  validate,
  asyncHandler(bookingController.confirmBooking)
);

// Direct booking (no Razorpay — for demo/dev)
router.post(
  "/direct",
  authenticate,
  authorize("CLIENT"),
  [body("caId").notEmpty(), body("serviceId").notEmpty(), body("slotId").notEmpty()],
  validate,
  asyncHandler(bookingController.directBook)
);

router.get("/my", authenticate, bookingController.getClientBookings);
router.get("/ca", authenticate, authorize("CA_PROFESSIONAL"), bookingController.getCABookings);

// Client joins meeting — records timestamp, hides link on re-load
router.post("/:id/join", authenticate, authorize("CLIENT"), asyncHandler(async (req, res) => {
  const { prisma } = await import("../config/prisma");
  const { sendSuccess, sendError } = await import("../utils/apiResponse");
  const userId = req.user!.userId;

  const client = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!client) return sendError(res, "Client profile not found", 404);

  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, clientProfileId: client.id },
  });
  if (!booking) return sendError(res, "Booking not found", 404);
  if (!booking.meetingLink) return sendError(res, "No meeting link available", 400);

  if (!booking.clientJoinedAt) {
    await prisma.booking.update({
      where: { id: booking.id },
      data: { clientJoinedAt: new Date() },
    });
  }

  return sendSuccess(res, "Join recorded", { meetingLink: booking.meetingLink });
}));

router.patch("/:id/reschedule", authenticate, authorize("CLIENT"), asyncHandler(async (req, res) => {
  const { prisma } = await import("../config/prisma");
  const { sendSuccess, sendError } = await import("../utils/apiResponse");
  const userId = req.user!.userId;
  const { slotId } = req.body;

  if (!slotId) return sendError(res, "New slot ID is required", 400);

  const client = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!client) return sendError(res, "Client profile not found", 404);

  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, clientProfileId: client.id },
  });
  if (!booking) return sendError(res, "Booking not found", 404);
  if (!["CONFIRMED", "PENDING"].includes(booking.status))
    return sendError(res, "Only confirmed or pending bookings can be rescheduled", 400);

  const newSlot = await prisma.timeSlot.findUnique({ where: { id: slotId } });
  if (!newSlot || newSlot.isBooked || newSlot.isBlocked)
    return sendError(res, "Selected slot is not available", 400);
  if (newSlot.caProfessionalId !== booking.caProfessionalId)
    return sendError(res, "Slot does not belong to the same CA", 400);

  const scheduledAt = new Date(`${newSlot.date.toISOString().split("T")[0]}T${newSlot.startTime}`);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.timeSlot.update({ where: { id: booking.timeSlotId }, data: { isBooked: false } });
    await tx.timeSlot.update({ where: { id: slotId }, data: { isBooked: true } });
    return tx.booking.update({
      where: { id: booking.id },
      data: { timeSlotId: slotId, scheduledAt, clientJoinedAt: null },
    });
  });

  // Fire notifications in background
  const { whatsappService } = await import("../services/whatsapp.service");
  const { sendEmail, emailTemplates } = await import("../services/email.service");
  const full = await prisma.booking.findUnique({
    where: { id: booking.id },
    include: {
      clientProfile: { include: { user: { select: { email: true, phone: true } } } },
      caProfessional: { include: { user: { select: { email: true, phone: true } } } },
      service: { select: { name: true } },
    },
  });
  if (full) {
    const newDate = format(scheduledAt, "dd MMM yyyy");
    const newTime = `${newSlot.startTime} - ${newSlot.endTime}`;
    const notifData = {
      clientName: `${full.clientProfile.firstName} ${full.clientProfile.lastName}`,
      caName: `${full.caProfessional.firstName} ${full.caProfessional.lastName}`,
      service: full.service?.name || "",
      newDate, newTime,
      meetLink: full.meetingLink || "",
      bookingNumber: full.bookingNumber,
      rescheduledBy: "CLIENT" as const,
    };
    Promise.allSettled([
      sendEmail({ to: full.clientProfile.user.email, ...emailTemplates.rescheduleConfirmation(notifData) }),
      sendEmail({ to: full.caProfessional.user.email, ...emailTemplates.rescheduleConfirmation({ ...notifData, clientName: `${full.caProfessional.firstName} ${full.caProfessional.lastName}` }) }),
      full.clientProfile.user.phone && whatsappService.sendRescheduleNotification({ ...notifData, phone: full.clientProfile.user.phone, name: notifData.clientName }),
      full.caProfessional.user.phone && whatsappService.sendRescheduleNotification({ ...notifData, phone: full.caProfessional.user.phone, name: notifData.caName }),
    ]).catch(() => {});
  }

  return sendSuccess(res, "Booking rescheduled successfully", updated);
}));

// CA reschedules a booking — proposes a new slot from their own schedule
router.patch("/:id/ca-reschedule", authenticate, authorize("CA_PROFESSIONAL"), asyncHandler(async (req, res) => {
  const { prisma } = await import("../config/prisma");
  const { sendSuccess, sendError } = await import("../utils/apiResponse");
  const userId = req.user!.userId;
  const { slotId } = req.body;

  if (!slotId) return sendError(res, "New slot ID is required", 400);

  const ca = await prisma.cAProfessional.findUnique({ where: { userId } });
  if (!ca) return sendError(res, "CA profile not found", 404);

  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, caProfessionalId: ca.id },
  });
  if (!booking) return sendError(res, "Booking not found", 404);
  if (!["CONFIRMED", "PENDING"].includes(booking.status))
    return sendError(res, "Only confirmed or pending bookings can be rescheduled", 400);

  const newSlot = await prisma.timeSlot.findUnique({ where: { id: slotId } });
  if (!newSlot || newSlot.isBooked || newSlot.isBlocked)
    return sendError(res, "Selected slot is not available", 400);
  if (newSlot.caProfessionalId !== ca.id)
    return sendError(res, "Slot does not belong to your schedule", 400);

  const scheduledAt = new Date(`${newSlot.date.toISOString().split("T")[0]}T${newSlot.startTime}`);

  const updated = await prisma.$transaction(async (tx) => {
    await tx.timeSlot.update({ where: { id: booking.timeSlotId }, data: { isBooked: false } });
    await tx.timeSlot.update({ where: { id: slotId }, data: { isBooked: true } });
    return tx.booking.update({
      where: { id: booking.id },
      data: { timeSlotId: slotId, scheduledAt, clientJoinedAt: null },
    });
  });

  // Fire notifications in background
  const { whatsappService } = await import("../services/whatsapp.service");
  const { sendEmail, emailTemplates } = await import("../services/email.service");
  const full = await prisma.booking.findUnique({
    where: { id: booking.id },
    include: {
      clientProfile: { include: { user: { select: { email: true, phone: true } } } },
      caProfessional: { include: { user: { select: { email: true, phone: true } } } },
      service: { select: { name: true } },
    },
  });
  if (full) {
    const newDate = format(scheduledAt, "dd MMM yyyy");
    const newTime = `${newSlot.startTime} - ${newSlot.endTime}`;
    const notifData = {
      clientName: `${full.clientProfile.firstName} ${full.clientProfile.lastName}`,
      caName: `${full.caProfessional.firstName} ${full.caProfessional.lastName}`,
      service: full.service?.name || "",
      newDate, newTime,
      meetLink: full.meetingLink || "",
      bookingNumber: full.bookingNumber,
      rescheduledBy: "CA" as const,
    };
    Promise.allSettled([
      sendEmail({ to: full.clientProfile.user.email, ...emailTemplates.rescheduleConfirmation(notifData) }),
      sendEmail({ to: full.caProfessional.user.email, ...emailTemplates.rescheduleConfirmation({ ...notifData, clientName: `${full.caProfessional.firstName} ${full.caProfessional.lastName}` }) }),
      full.clientProfile.user.phone && whatsappService.sendRescheduleNotification({ ...notifData, phone: full.clientProfile.user.phone, name: notifData.clientName }),
      full.caProfessional.user.phone && whatsappService.sendRescheduleNotification({ ...notifData, phone: full.caProfessional.user.phone, name: notifData.caName }),
    ]).catch(() => {});
  }

  return sendSuccess(res, "Meeting rescheduled successfully", updated);
}));

// CA manually sends meeting details to client (email + WhatsApp)
router.post("/:id/send-meeting-details", authenticate, authorize("CA_PROFESSIONAL"), asyncHandler(async (req, res) => {
  const { prisma } = await import("../config/prisma");
  const { sendSuccess, sendError } = await import("../utils/apiResponse");
  const { whatsappService } = await import("../services/whatsapp.service");
  const { sendEmail, emailTemplates } = await import("../services/email.service");
  const userId = req.user!.userId;

  const ca = await prisma.cAProfessional.findUnique({ where: { userId } });
  if (!ca) return sendError(res, "CA profile not found", 404);

  const booking = await prisma.booking.findFirst({
    where: { id: req.params.id, caProfessionalId: ca.id },
    include: {
      clientProfile: { include: { user: { select: { email: true, phone: true } } } },
      caProfessional: true,
      service: { select: { name: true } },
      timeSlot: true,
    },
  });
  if (!booking) return sendError(res, "Booking not found", 404);
  if (booking.status !== "CONFIRMED") return sendError(res, "Can only send details for confirmed bookings", 400);
  if (!booking.meetingLink) return sendError(res, "No meeting link available for this booking", 400);

  const date = format(new Date(booking.scheduledAt), "dd MMM yyyy");
  const time = booking.timeSlot ? `${booking.timeSlot.startTime} - ${booking.timeSlot.endTime}` : format(new Date(booking.scheduledAt), "hh:mm a");
  const clientName = `${booking.clientProfile.firstName} ${booking.clientProfile.lastName}`;
  const caName = `${ca.firstName} ${ca.lastName}`;

  const notifData = {
    clientName, caName,
    service: booking.service?.name || "",
    date, time,
    meetLink: booking.meetingLink,
    bookingNumber: booking.bookingNumber,
  };

  const results = await Promise.allSettled([
    sendEmail({ to: booking.clientProfile.user.email, ...emailTemplates.meetingDetails(notifData) }),
    booking.clientProfile.user.phone
      ? whatsappService.sendMeetingDetails({ ...notifData, phone: booking.clientProfile.user.phone, name: clientName })
      : Promise.resolve(),
  ]);

  const emailSent = results[0].status === "fulfilled";
  const whatsappSent = results[1].status === "fulfilled";

  return sendSuccess(res, "Meeting details sent", { emailSent, whatsappSent });
}));

router.put(
  "/:id/cancel",
  authenticate,
  [body("reason").optional().isString()],
  asyncHandler(bookingController.cancelBooking)
);

router.post(
  "/review",
  authenticate,
  authorize("CLIENT"),
  [
    body("bookingId").notEmpty(),
    body("rating").isInt({ min: 1, max: 5 }),
    body("comment").optional().isString(),
  ],
  validate,
  asyncHandler(bookingController.submitReview)
);

// Allow POST /bookings/:id/review (bookingId from URL param)
router.post(
  "/:id/review",
  authenticate,
  authorize("CLIENT"),
  [body("rating").isInt({ min: 1, max: 5 }), body("comment").optional().isString()],
  validate,
  asyncHandler(async (req, res) => {
    req.body.bookingId = req.params.id;
    return bookingController.submitReview(req, res);
  })
);

export default router;
