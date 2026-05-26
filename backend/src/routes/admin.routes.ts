import { asyncHandler } from "../utils/asyncHandler";
import { Router } from "express";
import bcrypt from "bcryptjs";
import * as adminController from "../controllers/admin.controller";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate, authorize("SUPER_ADMIN"));

router.get("/dashboard", adminController.getDashboardStats);
router.get("/analytics", adminController.getPlatformAnalytics);

router.get("/cas", adminController.listAllCAs);
router.put("/cas/:id/approve", adminController.approveCA);
router.put("/cas/:id/reject", adminController.rejectCA);
router.put("/cas/:id/suspend", adminController.suspendCA);

router.get("/users", adminController.listAllUsers);
router.put("/users/:id/toggle", adminController.toggleUserStatus);

router.get("/settings", adminController.getPlatformSettings);
router.put("/settings", adminController.updatePlatformSettings);

// ── Service Management ──────────────────────────────────────────────────────

router.get("/services", async (_req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const services = await prisma.service.findMany({
      include: { benefits: true, _count: { select: { bookings: true, specializations: true } } },
      orderBy: { sortOrder: "asc" },
    });
    res.json({ success: true, data: services });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch services" });
  }
});

router.patch("/services/:id", async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const { name, shortDescription, basePrice, isActive, isFeatured, showPrice, sortOrder } = req.body;
    const updated = await prisma.service.update({
      where: { id: req.params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(shortDescription !== undefined && { shortDescription }),
        ...(basePrice !== undefined && { basePrice: Number(basePrice) }),
        ...(isActive !== undefined && { isActive }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(showPrice !== undefined && { showPrice }),
        ...(sortOrder !== undefined && { sortOrder: Number(sortOrder) }),
      },
    });
    res.json({ success: true, data: updated, message: "Service updated" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update service" });
  }
});

// ── Assistance Team Management ──────────────────────────────────────────────

router.get("/assistance-team", async (_req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const members = await prisma.assistanceMember.findMany({
      include: {
        user: { select: { id: true, email: true, phone: true, isActive: true, createdAt: true } },
        assignedCases: { select: { id: true, status: true } },
        assignedTasks: { select: { id: true, status: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json({ success: true, data: members });
  } catch {
    res.status(500).json({ success: false, message: "Failed to fetch assistance team" });
  }
});

router.post("/assistance-team", async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const { email, password, phone, firstName, lastName, designation, department } = req.body;
    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({ success: false, message: "email, password, firstName, lastName are required" });
    }
    const exists = await prisma.user.findUnique({ where: { email } });
    if (exists) return res.status(409).json({ success: false, message: "Email already registered" });

    const passwordHash = await bcrypt.hash(password, 12);
    const user = await prisma.user.create({
      data: {
        email,
        phone: phone || null,
        passwordHash,
        role: "ASSISTANCE_TEAM",
        isEmailVerified: true,
        assistanceMember: {
          create: { firstName, lastName, designation: designation || null, department: department || null },
        },
      },
      include: { assistanceMember: true },
    });
    return res.status(201).json({ success: true, data: user, message: "Assistance team member created" });
  } catch {
    res.status(500).json({ success: false, message: "Failed to create assistance team member" });
  }
});

router.patch("/assistance-team/:id", async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const { firstName, lastName, designation, department, isActive } = req.body;
    const updated = await prisma.assistanceMember.update({
      where: { id: req.params.id },
      data: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(designation !== undefined && { designation }),
        ...(department !== undefined && { department }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    res.json({ success: true, data: updated });
  } catch {
    res.status(500).json({ success: false, message: "Failed to update assistance team member" });
  }
});

export default router;
