import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

// All routes require authentication
router.use(authenticate);

// ── Tasks ──────────────────────────────────────────────────────────────────

router.get("/tasks", authorize("ASSISTANCE_TEAM", "SUPER_ADMIN"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const user = req.user as any;
    const { status, priority, page = "1", limit = "20", myTasks } = req.query as Record<string, string>;

    const where: Record<string, any> = {};
    if (status) where.status = status;
    if (priority) where.priority = priority;

    // If myTasks=true, filter by the logged-in assistance member
    if (myTasks === "true" && user.role === "ASSISTANCE_TEAM") {
      const member = await prisma.assistanceMember.findUnique({ where: { userId: user.userId } });
      if (member) where.assignedToId = member.id;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [tasks, total] = await Promise.all([
      prisma.task.findMany({
        where,
        include: {
          assignedTo: { select: { firstName: true, lastName: true, designation: true } },
          assignedByCa: { select: { firstName: true, lastName: true, membershipNumber: true } },
          booking: {
            include: {
              clientProfile: { select: { firstName: true, lastName: true } },
              caProfessional: { select: { firstName: true, lastName: true } },
              service: { select: { name: true } },
            },
          },
          clientProfile: { select: { firstName: true, lastName: true } },
        },
        orderBy: [{ priority: "desc" }, { dueDate: "asc" }],
        skip,
        take: parseInt(limit),
      }),
      prisma.task.count({ where }),
    ]);
    res.json({ success: true, data: { tasks, total, page: parseInt(page), limit: parseInt(limit) } });
  } catch (err) {
    res.status(500).json({ success: false, message: "Failed to fetch tasks" });
  }
});

router.patch("/tasks/:id/status", authorize("ASSISTANCE_TEAM", "SUPER_ADMIN"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const { status } = req.body;
    const task = await prisma.task.update({
      where: { id: req.params.id },
      data: { status, ...(status === "COMPLETED" ? { completedAt: new Date() } : {}) },
    });
    res.json({ success: true, data: task });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update task" });
  }
});

// ── Documents Verification ──────────────────────────────────────────────────

router.get("/documents", authorize("ASSISTANCE_TEAM", "SUPER_ADMIN"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const user = req.user as any;
    const { status } = req.query as Record<string, string>;

    let clientIds: string[] = [];

    if (user.role === "ASSISTANCE_TEAM") {
      const member = await prisma.assistanceMember.findUnique({ where: { userId: user.userId } });
      if (!member) return res.status(404).json({ success: false, message: "Member not found" });

      // Only show documents from clients whose cases are assigned to this member
      const cases = await prisma.case.findMany({
        where: { assignedToId: member.id },
        select: { clientProfileId: true },
      });
      clientIds = cases.map(c => c.clientProfileId);
    }

    const where: any = {};
    if (clientIds.length > 0) where.clientProfileId = { in: clientIds };
    else if (user.role === "ASSISTANCE_TEAM") {
      // No cases assigned yet — return empty
      return res.json({ success: true, data: [] });
    }
    if (status && status !== "ALL") where.verificationStatus = status;

    const docs = await prisma.document.findMany({
      where,
      include: {
        clientProfile: { select: { id: true, firstName: true, lastName: true, companyName: true } },
        caProfessional: { select: { id: true, firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: docs });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: "Failed to fetch documents" });
  }
});

// Keep old route for backward compat
router.get("/documents/pending", authorize("ASSISTANCE_TEAM", "SUPER_ADMIN"), async (req, res) => {
  const user = req.user as any;
  // Forward to the new scoped route logic
  try {
    const { prisma } = await import("../config/prisma");
    let clientIds: string[] = [];
    if (user.role === "ASSISTANCE_TEAM") {
      const member = await prisma.assistanceMember.findUnique({ where: { userId: user.userId } });
      if (member) {
        const cases = await prisma.case.findMany({ where: { assignedToId: member.id }, select: { clientProfileId: true } });
        clientIds = cases.map(c => c.clientProfileId);
      }
    }
    const where: any = { verificationStatus: "PENDING" };
    if (clientIds.length > 0) where.clientProfileId = { in: clientIds };
    else if (user.role === "ASSISTANCE_TEAM") return res.json({ success: true, data: [] });

    const docs = await prisma.document.findMany({
      where,
      include: {
        clientProfile: { select: { firstName: true, lastName: true } },
        caProfessional: { select: { firstName: true, lastName: true } },
      },
      orderBy: { createdAt: "asc" },
    });
    res.json({ success: true, data: docs });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch documents" });
  }
});

router.patch("/documents/:id/verify", authorize("ASSISTANCE_TEAM", "SUPER_ADMIN"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const { status, rejectionReason } = req.body;
    const doc = await prisma.document.update({
      where: { id: req.params.id },
      data: {
        verificationStatus: status,
        isVerified: status === "VERIFIED",
        verifiedAt: status === "VERIFIED" ? new Date() : null,
        rejectionReason: rejectionReason || null,
      },
    });
    res.json({ success: true, data: doc });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update document" });
  }
});

// ── Dashboard Stats ─────────────────────────────────────────────────────────

router.get("/dashboard", authorize("ASSISTANCE_TEAM", "SUPER_ADMIN"), async (_req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const [
      activeTasks,
      pendingDocs,
      completedToday,
    ] = await Promise.all([
      prisma.task.count({ where: { status: { in: ["PENDING", "IN_PROGRESS"] } } }),
      prisma.document.count({ where: { verificationStatus: "PENDING" } }),
      prisma.task.count({
        where: {
          status: "COMPLETED",
          completedAt: { gte: new Date(new Date().setHours(0, 0, 0, 0)) },
        },
      }),
    ]);
    res.json({ success: true, data: { activeTasks, pendingDocs, completedToday } });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch dashboard" });
  }
});

export default router;
