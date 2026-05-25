import { Request, Response } from "express";
import crypto from "crypto";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { sendEmail } from "../services/email.service";
import { whatsappService } from "../services/whatsapp.service";

export const razorpayWebhook = async (req: Request, res: Response) => {
  const webhookSecret = env.RAZORPAY_WEBHOOK_SECRET as string | undefined;
  if (!webhookSecret) {
    return res.status(400).json({ success: false, message: "Webhook not configured" });
  }

  const signature = req.headers["x-razorpay-signature"] as string;
  const body = JSON.stringify(req.body);

  const expectedSig = crypto
    .createHmac("sha256", webhookSecret)
    .update(body)
    .digest("hex");

  if (expectedSig !== signature) {
    return res.status(400).json({ success: false, message: "Invalid webhook signature" });
  }

  const event = req.body.event;
  const payload = req.body.payload;

  if (event === "payment.captured") {
    const paymentId = payload.payment.entity.id;
    const orderId = payload.payment.entity.order_id;

    const payment = await prisma.payment.findUnique({ where: { razorpayOrderId: orderId } });
    if (!payment) return res.status(200).json({ received: true });

    if (payment.type === "CA_ONBOARDING") {
      await prisma.$transaction(async (tx) => {
        await tx.payment.update({
          where: { razorpayOrderId: orderId },
          data: { razorpayPaymentId: paymentId, status: "SUCCESS" },
        });

        if (payment.caProfessionalId) {
          await tx.cAProfessional.update({
            where: { id: payment.caProfessionalId },
            data: { status: "PENDING_APPROVAL" },
          });

          const ca = await tx.cAProfessional.findUnique({
            where: { id: payment.caProfessionalId },
            include: { user: true },
          });

          if (ca) {
            const expiresAt = new Date();
            expiresAt.setFullYear(expiresAt.getFullYear() + 1);

            await tx.cASubscription.create({
              data: {
                caProfessionalId: ca.id,
                plan: "BASIC",
                status: "ACTIVE",
                startsAt: new Date(),
                expiresAt,
              },
            });

            await Promise.allSettled([
              sendEmail({
                to: ca.user.email,
                subject: "Payment Received - Account Under Review",
                html: `<p>Hi ${ca.firstName}, your onboarding payment of ₹499 was received. Your profile is under review and will be activated within 24 hours.</p>`,
              }),
              ca.user.phone &&
                whatsappService.sendPaymentConfirmation({
                  phone: ca.user.phone,
                  name: ca.firstName,
                  amount: env.CA_ONBOARDING_FEE,
                  orderId: orderId,
                  description: "CA Professional Onboarding Fee",
                }),
            ]);
          }
        }
      });
    }
  }

  if (event === "payment.failed") {
    const orderId = payload.payment.entity.order_id;
    await prisma.payment.updateMany({
      where: { razorpayOrderId: orderId },
      data: { status: "FAILED" },
    });
  }

  if (event === "refund.processed") {
    const paymentId = payload.refund.entity.payment_id;
    await prisma.payment.updateMany({
      where: { razorpayPaymentId: paymentId },
      data: { status: "REFUNDED" },
    });
  }

  return res.status(200).json({ received: true });
};

export const getPaymentHistory = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { page = "1", limit = "10" } = req.query as Record<string, string>;

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: {
      clientProfile: { select: { id: true } },
      caProfessional: { select: { id: true } },
    },
  });

  if (!user) return sendError(res, "User not found", 404);

  const where: any = {};
  if (user.clientProfile) where.clientProfileId = user.clientProfile.id;
  else if (user.caProfessional) where.caProfessionalId = user.caProfessional.id;

  const [payments, total] = await prisma.$transaction([
    prisma.payment.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        booking: {
          select: {
            bookingNumber: true,
            service: { select: { name: true } },
          },
        },
      },
    }),
    prisma.payment.count({ where }),
  ]);

  return sendSuccess(res, "Payment history", payments, 200, {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
  });
};
