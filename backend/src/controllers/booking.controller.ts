import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { razorpay } from "../config/razorpay";
import { env } from "../config/env";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { generateBookingNumber, generateOrderId } from "../utils/generateId";
import { googleCalendarService } from "../services/googleCalendar.service";
import { whatsappService } from "../services/whatsapp.service";
import { sendEmail, emailTemplates } from "../services/email.service";
import { logger } from "../utils/logger";
import { format } from "date-fns";

export const createBookingOrder = async (req: Request, res: Response) => {
  const { caId, serviceId, slotId } = req.body;
  const userId = req.user!.userId;

  const client = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!client) return sendError(res, "Client profile not found", 404);

  const [ca, service, slot] = await Promise.all([
    prisma.cAProfessional.findUnique({ where: { id: caId } }),
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.timeSlot.findUnique({ where: { id: slotId } }),
  ]);

  if (!ca || ca.status !== "ACTIVE") return sendError(res, "CA not available", 400);
  if (!service) return sendError(res, "Service not found", 404);
  if (!slot || slot.isBooked || slot.isBlocked)
    return sendError(res, "Time slot not available", 400);

  if (!razorpay) {
    return sendError(res, "Payment service not configured. Please use direct booking.", 503);
  }

  const amount = ca.consultationFee;
  const orderId = generateOrderId();

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: orderId,
    notes: {
      type: "CONSULTATION",
      caId,
      serviceId,
      slotId,
      clientId: client.id,
    },
  });

  await prisma.payment.create({
    data: {
      orderId,
      razorpayOrderId: order.id,
      amount,
      status: "PENDING",
      type: "CONSULTATION",
      description: `${service.name} consultation with ${ca.firstName} ${ca.lastName}`,
      clientProfileId: client.id,
      caProfessionalId: ca.id,
    },
  });

  return sendSuccess(res, "Order created", {
    razorpayOrderId: order.id,
    amount,
    currency: "INR",
    key: env.RAZORPAY_KEY_ID,
    prefill: {
      name: `${client.firstName} ${client.lastName}`,
      email: (await prisma.user.findUnique({ where: { id: userId } }))?.email,
    },
  });
};

export const confirmBooking = async (req: Request, res: Response) => {
  const {
    razorpayOrderId,
    razorpayPaymentId,
    razorpaySignature,
    caId,
    serviceId,
    slotId,
  } = req.body;
  const userId = req.user!.userId;

  const keySecret = env.RAZORPAY_KEY_SECRET as string | undefined;
  if (keySecret) {
    const crypto = await import("crypto");
    const expectedSig = crypto
      .createHmac("sha256", keySecret)
      .update(`${razorpayOrderId}|${razorpayPaymentId}`)
      .digest("hex");
    if (expectedSig !== razorpaySignature)
      return sendError(res, "Payment verification failed", 400);
  }

  const client = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!client) return sendError(res, "Client profile not found", 404);

  const [ca, service, slot] = await Promise.all([
    prisma.cAProfessional.findUnique({
      where: { id: caId },
      include: { user: { select: { email: true, phone: true } } },
    }),
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.timeSlot.findUnique({ where: { id: slotId } }),
  ]);

  if (!ca || !service || !slot) return sendError(res, "Invalid booking data", 400);
  if (slot.isBooked) return sendError(res, "Slot already booked", 409);

  const scheduledAt = new Date(`${slot.date.toISOString().split("T")[0]}T${slot.startTime}`);
  const endDateTime = new Date(scheduledAt);
  endDateTime.setMinutes(endDateTime.getMinutes() + 45);

  const bookingNumber = generateBookingNumber();
  const platformFee = Math.round((ca.consultationFee * env.PLATFORM_COMMISSION_PERCENT) / 100);
  const caEarning = ca.consultationFee - platformFee;

  const clientUser = await prisma.user.findUnique({ where: { id: userId } });

  // Create booking immediately with a fallback Meet link — don't block on Calendar API
  const booking = await prisma.$transaction(async (tx) => {
    await tx.timeSlot.update({ where: { id: slotId }, data: { isBooked: true } });

    await tx.payment.update({
      where: { razorpayOrderId },
      data: { razorpayPaymentId, razorpaySignature, status: "SUCCESS" },
    });

    const bk = await tx.booking.create({
      data: {
        bookingNumber,
        clientProfileId: client.id,
        caProfessionalId: caId,
        serviceId,
        timeSlotId: slotId,
        status: "CONFIRMED",
        scheduledAt,
        meetingLink: `https://meet.jit.si/CAConnect-${bookingNumber.replace(/[^a-zA-Z0-9]/g, "").slice(-10)}`,
        googleMeetLink: `https://meet.jit.si/CAConnect-${bookingNumber.replace(/[^a-zA-Z0-9]/g, "").slice(-10)}`,
        amount: ca.consultationFee,
        platformFee,
        caEarning,
      },
    });

    await tx.payment.update({ where: { razorpayOrderId }, data: { bookingId: bk.id } });
    await tx.earning.create({ data: { caProfessionalId: caId, bookingId: bk.id, amount: ca.consultationFee, platformFee, netAmount: caEarning } });
    await tx.cAProfessional.update({ where: { id: caId }, data: { totalConsultations: { increment: 1 }, totalEarnings: { increment: caEarning } } });

    return bk;
  });

  // Fire Calendar event creation in the background — updates booking with real Meet link
  googleCalendarService.createEvent({
    summary: `CA Consultation: ${service.name}`,
    description: `Client: ${client.firstName} ${client.lastName}\nCA: ${ca.firstName} ${ca.lastName}\nService: ${service.name}`,
    startDateTime: scheduledAt.toISOString(),
    endDateTime: endDateTime.toISOString(),
    attendees: [
      { email: clientUser?.email || "", displayName: `${client.firstName} ${client.lastName}` },
      { email: ca.user.email, displayName: `${ca.firstName} ${ca.lastName}` },
    ],
  }).then((calEvent) => {
    prisma.booking.update({
      where: { id: booking.id },
      data: {
        meetingLink: calEvent.meetLink,
        googleMeetLink: calEvent.meetLink,
        googleEventId: calEvent.eventId,
        calendarEventUrl: calEvent.eventUrl,
        meetingCode: calEvent.meetingCode,
      },
    }).catch((err) => logger.error("Failed to update booking with Meet link", err));
  }).catch((err) => logger.error("Calendar event creation failed", err));

  // Fire notifications in the background
  const dateStr = format(scheduledAt, "dd MMM yyyy");
  const timeStr = `${slot.startTime} - ${slot.endTime}`;
  const msgData = {
    clientName: `${client.firstName} ${client.lastName}`,
    caName: `${ca.firstName} ${ca.lastName}`,
    service: service.name,
    date: dateStr,
    time: timeStr,
    meetLink: `https://meet.google.com/new`,
    bookingNumber,
  };
  Promise.allSettled([
    sendEmail({ to: clientUser?.email || "", ...emailTemplates.bookingConfirmation(msgData) }),
    sendEmail({ to: ca.user.email, ...emailTemplates.bookingConfirmation({ ...msgData, clientName: ca.firstName + " " + ca.lastName }) }),
    clientUser?.phone && whatsappService.sendBookingConfirmation({ ...msgData, phone: clientUser.phone }),
    ca.user.phone && whatsappService.sendBookingConfirmation({ ...msgData, phone: ca.user.phone }),
  ]).catch(() => {});

  return sendSuccess(res, "Booking confirmed", { booking, meetLink: booking.meetingLink }, 201);
};

// Direct booking (demo mode — no Razorpay required)
export const directBook = async (req: Request, res: Response) => {
  const { caId, serviceId, slotId, notes } = req.body;
  const userId = req.user!.userId;

  const client = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!client) return sendError(res, "Client profile not found. Please complete your profile first.", 404);

  const [ca, service, slot] = await Promise.all([
    prisma.cAProfessional.findUnique({ where: { id: caId }, include: { user: { select: { email: true, phone: true } } } }),
    prisma.service.findUnique({ where: { id: serviceId } }),
    prisma.timeSlot.findUnique({ where: { id: slotId } }),
  ]);

  if (!ca || ca.status !== "ACTIVE") return sendError(res, "CA not available", 400);
  if (!service) return sendError(res, "Service not found", 404);
  if (!slot || slot.isBooked || slot.isBlocked) return sendError(res, "Time slot not available", 400);

  const scheduledAt = new Date(`${slot.date.toISOString().split("T")[0]}T${slot.startTime}`);
  const endDateTime = new Date(scheduledAt);
  endDateTime.setMinutes(endDateTime.getMinutes() + 45);

  const bookingNumber = generateBookingNumber();
  const platformFee = Math.round((ca.consultationFee * env.PLATFORM_COMMISSION_PERCENT) / 100);
  const caEarning = ca.consultationFee - platformFee;
  const clientUser = await prisma.user.findUnique({ where: { id: userId } });

  const orderId = generateOrderId();

  // Create booking immediately — don't block on Calendar API
  const booking = await prisma.$transaction(async (tx) => {
    await tx.timeSlot.update({ where: { id: slotId }, data: { isBooked: true } });

    const payment = await tx.payment.create({
      data: {
        orderId,
        razorpayOrderId: `demo_${orderId}`,
        amount: ca.consultationFee,
        status: "SUCCESS",
        type: "CONSULTATION",
        description: `${service.name} consultation with ${ca.firstName} ${ca.lastName}`,
        clientProfileId: client.id,
        caProfessionalId: ca.id,
      },
    });

    // Generate a guaranteed Jitsi Meet room immediately (no API needed)
    // Format: https://meet.jit.si/CAConnect-{last10charsOfOrderId}
    const jitsiRoom = `CAConnect-${orderId.replace(/[^a-zA-Z0-9]/g, "").slice(-10)}`;
    const instantMeetLink = `https://meet.jit.si/${jitsiRoom}`;

    const bk = await tx.booking.create({
      data: {
        bookingNumber,
        clientProfileId: client.id,
        caProfessionalId: caId,
        serviceId,
        timeSlotId: slotId,
        status: "CONFIRMED",
        scheduledAt,
        duration: 45,
        meetingLink: instantMeetLink,
        googleMeetLink: instantMeetLink,
        notes,
        amount: ca.consultationFee,
        platformFee,
        caEarning,
      },
    });

    await tx.payment.update({ where: { id: payment.id }, data: { bookingId: bk.id } });
    await tx.earning.create({ data: { caProfessionalId: caId, bookingId: bk.id, amount: ca.consultationFee, platformFee, netAmount: caEarning } });
    await tx.cAProfessional.update({ where: { id: caId }, data: { totalConsultations: { increment: 1 }, totalEarnings: { increment: caEarning } } });

    return bk;
  });

  // Send booking confirmation notifications immediately (with placeholder link)
  const dateStr = format(scheduledAt, "dd MMM yyyy");
  const timeStr = `${slot.startTime} - ${slot.endTime}`;
  const notifData = {
    clientName: `${client.firstName} ${client.lastName}`,
    caName: `${ca.firstName} ${ca.lastName}`,
    service: service.name,
    date: dateStr,
    time: timeStr,
    meetLink: booking.meetingLink || "", // Real Jitsi link available immediately
    bookingNumber: booking.bookingNumber,
  };
  Promise.allSettled([
    sendEmail({ to: clientUser?.email || "", ...emailTemplates.bookingConfirmation(notifData) }),
    sendEmail({ to: ca.user.email, ...emailTemplates.bookingConfirmation({ ...notifData, clientName: `${ca.firstName} ${ca.lastName}` }) }),
    clientUser?.phone && whatsappService.sendBookingConfirmation({ ...notifData, phone: clientUser.phone }),
    ca.user.phone && whatsappService.sendBookingConfirmation({ ...notifData, phone: ca.user.phone }),
  ]).catch(() => {});

  // Fire Calendar event creation in the background — sends real Meet link when ready
  googleCalendarService.createEvent({
    summary: `CA Consultation: ${service.name}`,
    description: `Client: ${client.firstName} ${client.lastName}\nCA: ${ca.firstName} ${ca.lastName}\nService: ${service.name}`,
    startDateTime: scheduledAt.toISOString(),
    endDateTime: endDateTime.toISOString(),
    attendees: [
      { email: clientUser?.email || "", displayName: `${client.firstName} ${client.lastName}` },
      { email: ca.user.email, displayName: `${ca.firstName} ${ca.lastName}` },
    ],
  }).then((calEvent) => {
    if (!calEvent.meetLink) return;
    prisma.booking.update({
      where: { id: booking.id },
      data: {
        meetingLink: calEvent.meetLink,
        googleMeetLink: calEvent.meetLink,
        googleEventId: calEvent.eventId,
        calendarEventUrl: calEvent.eventUrl,
        meetingCode: calEvent.meetingCode,
      },
    }).then(() => {
      // Send follow-up notification with the real Meet link
      const meetingData = {
        clientName: `${client.firstName} ${client.lastName}`,
        caName: `${ca.firstName} ${ca.lastName}`,
        service: service.name,
        date: dateStr,
        time: timeStr,
        meetLink: calEvent.meetLink,
        bookingNumber: booking.bookingNumber,
      };
      Promise.allSettled([
        sendEmail({ to: clientUser?.email || "", ...emailTemplates.meetingDetails(meetingData) }),
        clientUser?.phone && whatsappService.sendMeetingDetails({ ...meetingData, phone: clientUser.phone, name: meetingData.clientName }),
      ]).catch(() => {});
    }).catch((err) => logger.error("Failed to update booking with Meet link", err));
  }).catch((err) => logger.error("Calendar event creation failed (directBook)", err));

  return sendSuccess(res, "Booking confirmed!", { booking, meetLink: booking.meetingLink }, 201);
};

export const getClientBookings = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { status, page = "1", limit = "10" } = req.query as Record<string, string>;

  const client = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!client) return sendError(res, "Client not found", 404);

  const where: any = {
    clientProfileId: client.id,
    ...(status && { status }),
  };

  const [bookings, total] = await prisma.$transaction([
    prisma.booking.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { scheduledAt: "desc" },
      include: {
        caProfessional: {
          select: { firstName: true, lastName: true, avatarUrl: true, city: true, consultationFee: true },
        },
        service: { select: { name: true, slug: true, iconUrl: true } },
        timeSlot: { select: { startTime: true, endTime: true, date: true } },
        payment: { select: { status: true, amount: true } },
        review: { select: { rating: true, comment: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return sendSuccess(res, "Bookings", bookings, 200, {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
  });
};

export const getCABookings = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { status, page = "1", limit = "10" } = req.query as Record<string, string>;

  const ca = await prisma.cAProfessional.findUnique({ where: { userId } });
  if (!ca) return sendError(res, "CA not found", 404);

  const where: any = {
    caProfessionalId: ca.id,
    ...(status && { status }),
  };

  const [bookings, total] = await prisma.$transaction([
    prisma.booking.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { scheduledAt: "desc" },
      include: {
        clientProfile: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            companyName: true,
          },
        },
        service: { select: { name: true, slug: true } },
        timeSlot: { select: { startTime: true, endTime: true, date: true } },
        payment: { select: { status: true, amount: true } },
      },
    }),
    prisma.booking.count({ where }),
  ]);

  return sendSuccess(res, "CA bookings", bookings, 200, {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
  });
};

export const cancelBooking = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;
  const userId = req.user!.userId;

  const booking = await prisma.booking.findUnique({
    where: { id },
    include: {
      clientProfile: { select: { userId: true } },
      caProfessional: { select: { userId: true, firstName: true, lastName: true } },
    },
  });
  if (!booking) return sendError(res, "Booking not found", 404);

  const isClient = booking.clientProfile.userId === userId;
  const isCA = booking.caProfessional.userId === userId;
  if (!isClient && !isCA) return sendError(res, "Unauthorized", 403);

  if (!["PENDING", "CONFIRMED"].includes(booking.status))
    return sendError(res, "Booking cannot be cancelled", 400);

  await prisma.$transaction([
    prisma.booking.update({
      where: { id },
      data: { status: "CANCELLED", cancellationReason: reason },
    }),
    prisma.timeSlot.update({
      where: { id: booking.timeSlotId },
      data: { isBooked: false },
    }),
  ]);

  if (booking.googleEventId) {
    await googleCalendarService.cancelEvent(booking.googleEventId).catch(() => {});
  }

  return sendSuccess(res, "Booking cancelled");
};

export const submitReview = async (req: Request, res: Response) => {
  const { bookingId, rating, comment } = req.body;
  const userId = req.user!.userId;

  const client = await prisma.clientProfile.findUnique({ where: { userId } });
  if (!client) return sendError(res, "Client profile not found", 404);

  const booking = await prisma.booking.findUnique({ where: { id: bookingId } });
  if (!booking || booking.clientProfileId !== client.id)
    return sendError(res, "Booking not found", 404);
  if (booking.status !== "COMPLETED")
    return sendError(res, "Can only review completed bookings", 400);

  const existing = await prisma.review.findUnique({ where: { bookingId } });
  if (existing) return sendError(res, "Review already submitted", 409);

  const review = await prisma.review.create({
    data: {
      clientProfileId: client.id,
      caProfessionalId: booking.caProfessionalId,
      bookingId,
      rating,
      comment,
    },
  });

  const allReviews = await prisma.review.aggregate({
    where: { caProfessionalId: booking.caProfessionalId, isPublished: true },
    _avg: { rating: true },
    _count: { rating: true },
  });

  await prisma.cAProfessional.update({
    where: { id: booking.caProfessionalId },
    data: {
      averageRating: allReviews._avg.rating || 0,
      totalReviews: allReviews._count.rating,
    },
  });

  return sendSuccess(res, "Review submitted", review, 201);
};
