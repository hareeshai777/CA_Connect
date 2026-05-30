import { asyncHandler } from "../utils/asyncHandler";
import { Router } from "express";
import { body } from "express-validator";
import * as caController from "../controllers/ca.controller";
import { authenticate, authorize } from "../middleware/auth";
import { validate } from "../middleware/validate";
import { upload, uploadToCloudinary } from "../middleware/upload";

const router = Router();

router.get("/", caController.listCAs);

router.post(
  "/register",
  authenticate,
  // Allow any authenticated user — the controller upgrades role to CA_PROFESSIONAL
  [
    body("firstName").trim().notEmpty(),
    body("lastName").trim().notEmpty(),
    body("consultationFee").isInt({ min: 0 }).optional(),
    body("experienceYears").isInt({ min: 0 }),
  ],
  validate,
  asyncHandler(caController.registerCA)
);

// Fix role for users who registered as CLIENT but have a CA profile
router.post("/fix-role", authenticate, asyncHandler(async (req, res) => {
  const { prisma } = await import("../config/prisma");
  const { sendSuccess, sendError } = await import("../utils/apiResponse");
  const userId = req.user!.userId;
  const caProfile = await prisma.cAProfessional.findUnique({ where: { userId } });
  if (!caProfile) return sendError(res, "No CA profile found for this account", 404);
  await prisma.user.update({ where: { id: userId }, data: { role: "CA_PROFESSIONAL" } });
  return sendSuccess(res, "Role updated to CA_PROFESSIONAL. Please log out and log in again.");
}));

router.put("/profile", authenticate, authorize("CA_PROFESSIONAL"), caController.updateCAProfile);
router.get("/my/profile", authenticate, authorize("CA_PROFESSIONAL"), caController.getMyCAProfile);
router.get("/my/dashboard", authenticate, authorize("CA_PROFESSIONAL"), caController.getCADashboardStats);
router.get("/my/timeslots", authenticate, authorize("CA_PROFESSIONAL"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const ca = await prisma.cAProfessional.findUnique({ where: { userId: req.user!.userId } });
    if (!ca) return res.status(404).json({ success: false, message: "CA profile not found" });
    const slots = await prisma.timeSlot.findMany({
      where: { caProfessionalId: ca.id },
      orderBy: [{ date: "asc" }, { startTime: "asc" }],
    });
    return res.json({ success: true, data: slots });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch time slots" });
  }
});

router.post(
  "/upload/documents",
  authenticate,
  authorize("CA_PROFESSIONAL"),
  upload.array("documents", 5),
  asyncHandler(caController.uploadCADocuments)
);

router.post(
  "/upload/avatar",
  authenticate,
  authorize("CA_PROFESSIONAL"),
  upload.single("avatar"),
  asyncHandler(caController.uploadAvatar)
);

// Upload CA professional certificate (called after registration)
router.post(
  "/upload/certificate",
  authenticate,
  authorize("CA_PROFESSIONAL"),
  upload.single("certificate"),
  asyncHandler(async (req, res) => {
    const { prisma } = await import("../config/prisma");
    const { sendSuccess, sendError } = await import("../utils/apiResponse");
    if (!req.file?.buffer) return sendError(res, "No file uploaded", 400);
    const ca = await prisma.cAProfessional.findUnique({ where: { userId: req.user!.userId } });
    if (!ca) return sendError(res, "CA profile not found", 404);
    const { url } = await uploadToCloudinary(req.file.buffer, "ca-connect/certificates", "raw");
    await prisma.cAProfessional.update({ where: { id: ca.id }, data: { certificateUrl: url } });
    return sendSuccess(res, "Certificate uploaded", { certificateUrl: url });
  })
);

router.post(
  "/slots",
  authenticate,
  authorize("CA_PROFESSIONAL"),
  [body("slots").isArray({ min: 1 })],
  validate,
  asyncHandler(caController.manageTimeSlots)
);

router.delete("/slots/:id", authenticate, authorize("CA_PROFESSIONAL"), asyncHandler(caController.deleteTimeSlot));

// ── Task Assignment (CA → Assistance Team) ──────────────────────────────────

// Create a task and assign to assistance team
router.post("/tasks", authenticate, authorize("CA_PROFESSIONAL"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const caUser = req.user as any;
    const ca = await prisma.cAProfessional.findUnique({ where: { userId: caUser.userId } });
    if (!ca) return res.status(404).json({ success: false, message: "CA profile not found" });

    const { title, description, priority, dueDate, bookingId, assignedToId, clientProfileId } = req.body;
    if (!title) return res.status(400).json({ success: false, message: "Title is required" });

    const count = await prisma.task.count();
    const taskNumber = `TASK-${String(count + 1).padStart(4, "0")}`;

    const task = await prisma.task.create({
      data: {
        taskNumber,
        title,
        description,
        priority: priority || "MEDIUM",
        dueDate: dueDate ? new Date(dueDate) : undefined,
        assignedByCaId: ca.id,
        caProfessionalId: ca.id,
        bookingId: bookingId || undefined,
        assignedToId: assignedToId || undefined,
        clientProfileId: clientProfileId || undefined,
      },
      include: {
        assignedTo: { select: { firstName: true, lastName: true, designation: true } },
        booking: { include: { service: { select: { name: true } }, clientProfile: { select: { firstName: true, lastName: true } } } },
      },
    });

    return res.status(201).json({ success: true, data: task, message: "Task assigned to assistance team" });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to create task" });
  }
});

// List tasks assigned by this CA
router.get("/tasks", authenticate, authorize("CA_PROFESSIONAL"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const caUser = req.user as any;
    const ca = await prisma.cAProfessional.findUnique({ where: { userId: caUser.userId } });
    if (!ca) return res.status(404).json({ success: false, message: "CA profile not found" });

    const { status, priority, page = "1", limit = "20" } = req.query as Record<string, string>;
    const where: Record<string, any> = { assignedByCaId: ca.id };
    if (status) where.status = status;
    if (priority) where.priority = priority;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignedTo: { select: { firstName: true, lastName: true, designation: true } },
          booking: { include: { service: { select: { name: true } }, clientProfile: { select: { firstName: true, lastName: true } } } },
          clientProfile: { select: { firstName: true, lastName: true } },
        },
        orderBy: [{ priority: "desc" }, { createdAt: "desc" }],
        skip,
        take: parseInt(limit),
      }),
      prisma.task.count({ where }),
    ]);

    return res.json({ success: true, data: { tasks, total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    return res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
});

// Update task status/priority (CA can update their own assigned tasks)
router.patch("/tasks/:id", authenticate, authorize("CA_PROFESSIONAL"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const caUser = req.user as any;
    const ca = await prisma.cAProfessional.findUnique({ where: { userId: caUser.userId } });
    if (!ca) return res.status(404).json({ success: false, message: "CA profile not found" });

    const { title, description, priority, dueDate, assignedToId, status } = req.body;
    const task = await prisma.task.update({
      where: { id: req.params.id, assignedByCaId: ca.id },
      data: {
        ...(title && { title }),
        ...(description !== undefined && { description }),
        ...(priority && { priority }),
        ...(dueDate && { dueDate: new Date(dueDate) }),
        ...(assignedToId !== undefined && { assignedToId }),
        ...(status && { status, ...(status === "COMPLETED" ? { completedAt: new Date() } : {}) }),
      },
      include: {
        assignedTo: { select: { firstName: true, lastName: true } },
      },
    });
    return res.json({ success: true, data: task });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update task" });
  }
});

// Get assistance team members for assignment dropdown (with workload)
router.get("/assistance-members", authenticate, authorize("CA_PROFESSIONAL"), async (_req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const members = await prisma.assistanceMember.findMany({
      where: { isActive: true },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        designation: true,
        department: true,
        avatarUrl: true,
        _count: {
          select: {
            assignedCases: {
              where: { status: { in: ["ASSIGNED", "IN_PROGRESS", "UNDER_REVIEW", "PENDING_CLIENT_INFO"] } },
            },
            assignedTasks: {
              where: { status: { in: ["PENDING", "IN_PROGRESS", "WAITING_FOR_CLIENT", "WAITING_FOR_CA"] } },
            },
          },
        },
      },
      orderBy: { firstName: "asc" },
    });
    return res.json({ success: true, data: members });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch assistance members" });
  }
});

// ── Dynamic /:id routes MUST come last to avoid shadowing named routes above ──
router.get("/:id", caController.getCAProfile);
router.get("/:id/slots", caController.getCATimeSlots);

export default router;
