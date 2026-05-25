import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";
import { upload } from "../middleware/upload";

const router = Router();

router.use(authenticate, authorize("CLIENT"));

// Get client profile
router.get("/profile", async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const profile = await prisma.clientProfile.findUnique({
      where: { userId: req.user!.userId },
    });
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });
    return res.json({ success: true, data: profile });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch profile" });
  }
});

// Update client profile
router.put("/profile", async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const { firstName, lastName, phone, city, state, pan, companyName } = req.body;

    // phone lives on User, not ClientProfile
    if (phone !== undefined) {
      await prisma.user.update({ where: { id: req.user!.userId }, data: { phone } });
    }

    const profile = await prisma.clientProfile.upsert({
      where: { userId: req.user!.userId },
      update: {
        ...(firstName !== undefined && { firstName }),
        ...(lastName !== undefined && { lastName }),
        ...(city !== undefined && { city }),
        ...(state !== undefined && { state }),
        ...(pan !== undefined && { pan }),
        ...(companyName !== undefined && { companyName }),
      },
      create: {
        userId: req.user!.userId,
        firstName: firstName || "",
        lastName: lastName || "",
        city: city || null,
        state: state || null,
        pan: pan || null,
        companyName: companyName || null,
      },
    });
    return res.json({ success: true, data: profile, message: "Profile updated" });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update profile" });
  }
});

// Upload avatar
router.post("/avatar", upload.single("avatar"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const avatarUrl = (req.file as any)?.path || (req as any).fileUrl;
    if (!avatarUrl) return res.status(400).json({ success: false, message: "No file uploaded" });
    const profile = await prisma.clientProfile.update({
      where: { userId: req.user!.userId },
      data: { avatarUrl },
    });
    return res.json({ success: true, data: profile });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to upload avatar" });
  }
});

// List client documents
router.get("/documents", async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const profile = await prisma.clientProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) return res.json({ success: true, data: [] });
    const docs = await prisma.document.findMany({
      where: { clientProfileId: profile.id },
      orderBy: { createdAt: "desc" },
    });
    return res.json({ success: true, data: docs });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch documents" });
  }
});

// Upload client document
router.post("/documents", upload.single("document"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const profile = await prisma.clientProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });
    const fileUrl = (req.file as any)?.path || (req as any).fileUrl;
    if (!fileUrl) return res.status(400).json({ success: false, message: "No file uploaded" });
    const doc = await prisma.document.create({
      data: {
        clientProfileId: profile.id,
        name: req.file?.originalname || "document",
        fileUrl,
        fileSize: req.file?.size,
        type: (req.body.type as any) || "CLIENT_DOCUMENT",
        mimeType: req.file?.mimetype || "application/octet-stream",
      },
    });
    return res.status(201).json({ success: true, data: doc });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to upload document" });
  }
});

// Delete client document
router.delete("/documents/:id", async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const profile = await prisma.clientProfile.findUnique({ where: { userId: req.user!.userId } });
    if (!profile) return res.status(404).json({ success: false, message: "Profile not found" });
    await prisma.document.deleteMany({ where: { id: req.params.id, clientProfileId: profile.id } });
    return res.json({ success: true, message: "Document deleted" });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to delete document" });
  }
});

export default router;
