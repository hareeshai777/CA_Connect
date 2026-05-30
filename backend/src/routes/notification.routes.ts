import { Router } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { authenticate } from "../middleware/auth";
import { prisma } from "../config/prisma";
import { sendSuccess } from "../utils/apiResponse";

const router = Router();
router.use(authenticate);

// Get my notifications (paginated)
router.get("/", asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  const { page = "1", limit = "20" } = req.query as Record<string, string>;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const [notifications, total, unread] = await prisma.$transaction([
    prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: "desc" },
      skip,
      take: parseInt(limit),
    }),
    prisma.notification.count({ where: { userId } }),
    prisma.notification.count({ where: { userId, isRead: false } }),
  ]);

  return res.json({ success: true, message: "Notifications", data: notifications, meta: { total, unread, page: parseInt(page) } });
}));

// Mark one as read
router.patch("/:id/read", asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  await prisma.notification.updateMany({
    where: { id: req.params.id, userId },
    data: { isRead: true },
  });
  return sendSuccess(res, "Marked as read");
}));

// Mark all as read
router.patch("/read-all", asyncHandler(async (req, res) => {
  const userId = req.user!.userId;
  await prisma.notification.updateMany({
    where: { userId, isRead: false },
    data: { isRead: true },
  });
  return sendSuccess(res, "All notifications marked as read");
}));

export default router;
