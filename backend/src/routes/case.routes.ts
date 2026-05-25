import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();
router.use(authenticate);

// ────────────────────────────────────────────────────────────
// STATIC ROUTES FIRST (must come before /:id)
// ────────────────────────────────────────────────────────────

// Open a new case after a consultation
router.post("/", authorize("CA_PROFESSIONAL"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const caUser = req.user as any;
    const ca = await prisma.cAProfessional.findUnique({ where: { userId: caUser.userId } });
    if (!ca) return res.status(404).json({ success: false, message: "CA profile not found" });

    const { bookingId, title, caNotes } = req.body;
    if (!bookingId || !title) return res.status(400).json({ success: false, message: "bookingId and title are required" });

    const booking = await prisma.booking.findFirst({
      where: { id: bookingId, caProfessionalId: ca.id },
    });
    if (!booking) return res.status(404).json({ success: false, message: "Booking not found" });

    const existing = await prisma.case.findUnique({ where: { bookingId } });
    if (existing) return res.status(409).json({ success: false, message: "Case already exists for this booking", data: existing });

    const count = await prisma.case.count();
    const caseNumber = `CASE-${String(count + 1).padStart(4, "0")}`;

    const newCase = await prisma.case.create({
      data: {
        caseNumber,
        title,
        caNotes: caNotes || null,
        bookingId,
        clientProfileId: booking.clientProfileId,
        caProfessionalId: ca.id,
      },
      include: caseInclude,
    });
    return res.status(201).json({ success: true, data: newCase });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to open case" });
  }
});

// List CA's own cases
router.get("/my", authorize("CA_PROFESSIONAL"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const caUser = req.user as any;
    const ca = await prisma.cAProfessional.findUnique({ where: { userId: caUser.userId } });
    if (!ca) return res.status(404).json({ success: false, message: "CA profile not found" });

    const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
    const where: any = { caProfessionalId: ca.id };
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [cases, total] = await Promise.all([
      prisma.case.findMany({ where, include: caseInclude, orderBy: { createdAt: "desc" }, skip, take: parseInt(limit) }),
      prisma.case.count({ where }),
    ]);
    return res.json({ success: true, data: { cases, total } });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch cases" });
  }
});

// Get cases assigned to this assistance member — MUST be before /:id
router.get("/assistance/my", authorize("ASSISTANCE_TEAM"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const user = req.user as any;
    const member = await prisma.assistanceMember.findUnique({ where: { userId: user.userId } });
    if (!member) return res.json({ success: true, data: { cases: [], total: 0 } });

    const { status, page = "1", limit = "20" } = req.query as Record<string, string>;
    const where: any = { assignedToId: member.id };
    if (status) where.status = status;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const [cases, total] = await Promise.all([
      prisma.case.findMany({ where, include: caseInclude, orderBy: { assignedAt: "desc" }, skip, take: parseInt(limit) }),
      prisma.case.count({ where }),
    ]);
    return res.json({ success: true, data: { cases, total } });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch assigned cases" });
  }
});

// ────────────────────────────────────────────────────────────
// DYNAMIC /:id ROUTES
// ────────────────────────────────────────────────────────────

// Get single case
router.get("/:id", authorize("CA_PROFESSIONAL", "ASSISTANCE_TEAM", "SUPER_ADMIN"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const caseData = await prisma.case.findUnique({ where: { id: req.params.id }, include: caseInclude });
    if (!caseData) return res.status(404).json({ success: false, message: "Case not found" });
    return res.json({ success: true, data: caseData });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch case" });
  }
});

// Update case notes (CA internal notes)
router.patch("/:id/notes", authorize("CA_PROFESSIONAL"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const caUser = req.user as any;
    const ca = await prisma.cAProfessional.findUnique({ where: { userId: caUser.userId} });
    if (!ca) return res.status(404).json({ success: false, message: "CA profile not found" });

    const { caNotes } = req.body;
    const updated = await prisma.case.update({
      where: { id: req.params.id, caProfessionalId: ca.id },
      data: { caNotes },
      include: caseInclude,
    });
    return res.json({ success: true, data: updated });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update case notes" });
  }
});

// Assign case to assistance team
router.patch("/:id/assign", authorize("CA_PROFESSIONAL"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const caUser = req.user as any;
    const ca = await prisma.cAProfessional.findUnique({ where: { userId: caUser.userId} });
    if (!ca) return res.status(404).json({ success: false, message: "CA profile not found" });

    const { assignedToId, assignmentInstructions, assistanceEarning } = req.body;
    if (!assignedToId) return res.status(400).json({ success: false, message: "assignedToId is required" });

    const updated = await prisma.case.update({
      where: { id: req.params.id, caProfessionalId: ca.id },
      data: {
        assignedToId,
        assignmentInstructions: assignmentInstructions || null,
        assistanceEarning: assistanceEarning || 0,
        status: "ASSIGNED",
        assignedAt: new Date(),
      },
      include: caseInclude,
    });
    return res.json({ success: true, data: updated, message: "Case assigned to assistance team" });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to assign case" });
  }
});

// Update case status + client update notes (CA only)
router.patch("/:id/status", authorize("CA_PROFESSIONAL"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const caUser = req.user as any;
    const ca = await prisma.cAProfessional.findUnique({ where: { userId: caUser.userId} });
    if (!ca) return res.status(404).json({ success: false, message: "CA profile not found" });

    const { status, clientUpdateNotes } = req.body;
    const updated = await prisma.case.update({
      where: { id: req.params.id, caProfessionalId: ca.id },
      data: {
        status,
        ...(clientUpdateNotes !== undefined && { clientUpdateNotes }),
        ...(status === "COMPLETED" || status === "CLOSED" ? { completedAt: new Date() } : {}),
      },
      include: caseInclude,
    });
    return res.json({ success: true, data: updated });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update case status" });
  }
});

// Assistance team updates case status and/or work notes
router.patch("/:id/assistance-status", authorize("ASSISTANCE_TEAM"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const user = req.user as any;
    const member = await prisma.assistanceMember.findUnique({ where: { userId: user.userId } });
    if (!member) return res.status(404).json({ success: false, message: "Not found" });

    const { status, assistanceWorkNotes } = req.body;

    const updateData: any = {};
    if (status) updateData.status = status;
    if (assistanceWorkNotes !== undefined) updateData.assistanceWorkNotes = assistanceWorkNotes;
    if (status === "COMPLETED") updateData.completedAt = new Date();

    const updated = await prisma.case.update({
      where: { id: req.params.id, assignedToId: member.id },
      data: updateData,
      include: caseInclude,
    });
    return res.json({ success: true, data: updated });
  } catch (err) {
    console.error(err);
    return res.status(500).json({ success: false, message: "Failed to update case" });
  }
});

// ────────────────────────────────────────────────────────────
// INTERNAL MESSAGES (CA ↔ Assistance Team only)
// ────────────────────────────────────────────────────────────

// Get messages for a case
router.get("/:id/messages", authorize("CA_PROFESSIONAL", "ASSISTANCE_TEAM"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const messages = await prisma.caseMessage.findMany({
      where: { caseId: req.params.id },
      include: { sender: { select: { id: true, email: true, role: true } } },
      orderBy: { createdAt: "asc" },
    });
    return res.json({ success: true, data: messages });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch messages" });
  }
});

// Send a message
router.post("/:id/messages", authorize("CA_PROFESSIONAL", "ASSISTANCE_TEAM"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const user = req.user as any;
    const { content } = req.body;
    if (!content?.trim()) return res.status(400).json({ success: false, message: "Content is required" });

    const senderRole = user.role === "CA_PROFESSIONAL" ? "CA" : "ASSISTANCE";
    const message = await prisma.caseMessage.create({
      data: {
        caseId: req.params.id,
        senderId: user.userId,
        senderRole,
        content: content.trim(),
      },
      include: { sender: { select: { id: true, email: true, role: true } } },
    });

    // Mark opposite party's messages as read
    await prisma.caseMessage.updateMany({
      where: { caseId: req.params.id, senderRole: senderRole === "CA" ? "ASSISTANCE" : "CA", isRead: false },
      data: { isRead: true },
    });

    return res.status(201).json({ success: true, data: message });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to send message" });
  }
});

// ────────────────────────────────────────────────────────────
// SHARED INCLUDE
// ────────────────────────────────────────────────────────────

const caseInclude = {
  booking: {
    select: {
      id: true,
      bookingNumber: true,
      scheduledAt: true,
      meetingLink: true,
      googleMeetLink: true,
      service: { select: { id: true, name: true, category: true } },
    },
  },
  clientProfile: {
    select: {
      id: true,
      firstName: true,
      lastName: true,
      companyName: true,
      user: { select: { email: true, phone: true } },
    },
  },
  caProfessional: {
    select: { id: true, firstName: true, lastName: true, membershipNumber: true },
  },
  assignedTo: {
    select: { id: true, firstName: true, lastName: true, designation: true, department: true },
  },
  messages: {
    orderBy: { createdAt: "asc" as const },
    take: 1,
    select: { id: true, content: true, senderRole: true, createdAt: true, isRead: true },
  },
} as const;

export default router;
