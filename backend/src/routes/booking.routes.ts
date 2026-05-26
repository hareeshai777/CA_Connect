import { asyncHandler } from "../utils/asyncHandler";
import { Router } from "express";
import { body } from "express-validator";
import * as bookingController from "../controllers/booking.controller";
import { authenticate, authorize } from "../middleware/auth";
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
router.get("/ca/bookings", authenticate, authorize("CA_PROFESSIONAL"), bookingController.getCABookings);

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

export default router;
