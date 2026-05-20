import { Router } from "express";
import { body } from "express-validator";
import { prisma } from "../config/prisma";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { validate } from "../middleware/validate";
import { authenticate, authorize } from "../middleware/auth";
import { globalLimiter } from "../middleware/rateLimiter";
import { sendEmail } from "../services/email.service";
import { env } from "../config/env";

const router = Router();

router.post(
  "/",
  globalLimiter,
  [
    body("name").trim().notEmpty(),
    body("email").isEmail(),
    body("message").trim().notEmpty().isLength({ min: 10 }),
  ],
  validate,
  async (req: any, res: any) => {
    const { name, email, phone, subject, message } = req.body;

    const lead = await prisma.contactLead.create({
      data: { name, email, phone, subject, message },
    });

    await sendEmail({
      to: env.SMTP_USER,
      subject: `New Contact: ${subject || "General Inquiry"} - ${name}`,
      html: `<p><strong>From:</strong> ${name} (${email})<br><strong>Phone:</strong> ${phone || "N/A"}<br><strong>Message:</strong><br>${message}</p>`,
    });

    return sendSuccess(res, "Message sent successfully", { id: lead.id }, 201);
  }
);

router.get("/", authenticate, authorize("SUPER_ADMIN"), async (req: any, res: any) => {
  const leads = await prisma.contactLead.findMany({
    orderBy: { createdAt: "desc" },
  });
  return sendSuccess(res, "Contact leads", leads);
});

export default router;
