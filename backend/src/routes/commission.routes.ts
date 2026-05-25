import { Router } from "express";
import { authenticate, authorize } from "../middleware/auth";

const router = Router();

router.use(authenticate);

// Get current commission settings
router.get("/settings", authorize("SUPER_ADMIN"), async (_req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const settings = await prisma.commissionSettings.findFirst({ where: { isActive: true }, orderBy: { effectiveFrom: "desc" } });
    if (!settings) {
      return res.json({ success: true, data: { platformCommissionPct: 20, caCommissionPct: 70, assistanceTeamPct: 10, consultationFeeFixed: 49900 } });
    }
    return res.json({ success: true, data: settings });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch commission settings" });
  }
});

// Update commission settings
router.put("/settings", authorize("SUPER_ADMIN"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const { platformCommissionPct, caCommissionPct, assistanceTeamPct, consultationFeeFixed } = req.body;

    if (platformCommissionPct + caCommissionPct + assistanceTeamPct !== 100) {
      return res.status(400).json({ success: false, message: "Percentages must add up to 100" });
    }

    // Deactivate previous settings
    await prisma.commissionSettings.updateMany({ where: { isActive: true }, data: { isActive: false } });

    // Create new settings
    const settings = await prisma.commissionSettings.create({
      data: {
        platformCommissionPct,
        caCommissionPct,
        assistanceTeamPct,
        consultationFeeFixed: consultationFeeFixed || 49900,
        isActive: true,
        updatedById: (req as any).user?.id,
      },
    });
    return res.json({ success: true, data: settings, message: "Commission settings updated successfully" });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to update commission settings" });
  }
});

// Get commission ledger
router.get("/ledger", authorize("SUPER_ADMIN"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const { page = "1", limit = "20", settled } = req.query as Record<string, string>;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const where: Record<string, any> = {};
    if (settled !== undefined) where.isSettled = settled === "true";

    const [records, total] = await Promise.all([
      prisma.commissionLedger.findMany({
        where,
        include: {
          booking: {
            include: {
              clientProfile: { select: { firstName: true, lastName: true } },
              service: { select: { name: true } },
            },
          },
        },
        orderBy: { createdAt: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.commissionLedger.count({ where }),
    ]);

    return res.json({ success: true, data: { records, total } });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to fetch commission ledger" });
  }
});

// Mark commission as settled
router.patch("/ledger/:id/settle", authorize("SUPER_ADMIN"), async (req, res) => {
  try {
    const { prisma } = await import("../config/prisma");
    const record = await prisma.commissionLedger.update({
      where: { id: req.params.id },
      data: { isSettled: true, settledAt: new Date() },
    });
    return res.json({ success: true, data: record });
  } catch {
    return res.status(500).json({ success: false, message: "Failed to settle commission" });
  }
});

export default router;
