import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { sendEmail, emailTemplates } from "../services/email.service";
import { whatsappService } from "../services/whatsapp.service";

export const getDashboardStats = async (req: Request, res: Response) => {
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalUsers,
    totalCAs,
    activeCAs,
    pendingCAs,
    totalBookings,
    thisMonthBookings,
    totalRevenue,
    thisMonthRevenue,
    recentBookings,
    recentCAs,
  ] = await prisma.$transaction([
    prisma.user.count({ where: { role: "CLIENT" } }),
    prisma.cAProfessional.count(),
    prisma.cAProfessional.count({ where: { status: "ACTIVE" } }),
    prisma.cAProfessional.count({ where: { status: "PENDING_APPROVAL" } }),
    prisma.booking.count(),
    prisma.booking.count({ where: { createdAt: { gte: startOfMonth } } }),
    prisma.payment.aggregate({
      where: { status: "SUCCESS", type: "CONSULTATION" },
      _sum: { amount: true },
    }),
    prisma.payment.aggregate({
      where: {
        status: "SUCCESS",
        type: "CONSULTATION",
        createdAt: { gte: startOfMonth },
      },
      _sum: { amount: true },
    }),
    prisma.booking.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      include: {
        clientProfile: { select: { firstName: true, lastName: true } },
        caProfessional: { select: { firstName: true, lastName: true } },
        service: { select: { name: true } },
      },
    }),
    prisma.cAProfessional.findMany({
      where: { status: "PENDING_APPROVAL" },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true } },
        documents: true,
      },
    }),
  ]);

  const platformRevenue = await prisma.payment.aggregate({
    where: { status: "SUCCESS" },
    _sum: { amount: true },
  });

  return sendSuccess(res, "Admin dashboard stats", {
    totalUsers,
    totalCAs,
    activeCAs,
    pendingCAs,
    totalBookings,
    thisMonthBookings,
    totalRevenue: totalRevenue._sum.amount || 0,
    thisMonthRevenue: thisMonthRevenue._sum.amount || 0,
    platformRevenue: platformRevenue._sum.amount || 0,
    recentBookings,
    pendingCAApprovals: recentCAs,
  });
};

export const listAllCAs = async (req: Request, res: Response) => {
  const { status, page = "1", limit = "20", search } = req.query as Record<string, string>;

  const where: any = {
    ...(status && { status }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { user: { email: { contains: search, mode: "insensitive" } } },
      ],
    }),
  };

  const [cas, total] = await prisma.$transaction([
    prisma.cAProfessional.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { email: true, phone: true, createdAt: true } },
        specializations: { include: { service: { select: { name: true } } } },
        subscription: true,
        _count: { select: { bookings: true, reviews: true } },
      },
    }),
    prisma.cAProfessional.count({ where }),
  ]);

  return sendSuccess(res, "CA list", cas, 200, {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
  });
};

export const approveCA = async (req: Request, res: Response) => {
  const { id } = req.params;

  const ca = await prisma.cAProfessional.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!ca) return sendError(res, "CA not found", 404);
  if (!["PENDING_APPROVAL", "PENDING_PAYMENT"].includes(ca.status))
    return sendError(res, "CA is not pending approval or payment", 400);

  await prisma.cAProfessional.update({
    where: { id },
    data: { status: "ACTIVE", isAvailable: true },
  });

  await Promise.allSettled([
    sendEmail({
      to: ca.user.email,
      ...emailTemplates.caActivation({ caName: `${ca.firstName} ${ca.lastName}` }),
    }),
    ca.user.phone &&
      whatsappService.sendCAActivation({
        phone: ca.user.phone,
        caName: `${ca.firstName} ${ca.lastName}`,
      }),
  ]);

  return sendSuccess(res, "CA approved and activated");
};

export const rejectCA = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { reason } = req.body;

  const ca = await prisma.cAProfessional.findUnique({
    where: { id },
    include: { user: true },
  });

  if (!ca) return sendError(res, "CA not found", 404);

  await prisma.cAProfessional.update({
    where: { id },
    data: { status: "REJECTED" },
  });

  await sendEmail({
    to: ca.user.email,
    subject: "CA Application Update - CA SaaS",
    html: `<p>Hi ${ca.firstName}, we regret to inform you that your CA application has been rejected. ${reason ? `Reason: ${reason}` : ""} Please contact support for more information.</p>`,
  });

  return sendSuccess(res, "CA rejected");
};

export const suspendCA = async (req: Request, res: Response) => {
  const { id } = req.params;
  await prisma.cAProfessional.update({ where: { id }, data: { status: "SUSPENDED", isAvailable: false } });
  return sendSuccess(res, "CA suspended");
};

export const listAllUsers = async (req: Request, res: Response) => {
  const { page = "1", limit = "20", search } = req.query as Record<string, string>;

  const where: any = {
    role: "CLIENT",
    ...(search && {
      OR: [
        { email: { contains: search, mode: "insensitive" } },
        { clientProfile: { firstName: { contains: search, mode: "insensitive" } } },
        { clientProfile: { lastName: { contains: search, mode: "insensitive" } } },
      ],
    }),
  };

  const [users, total] = await prisma.$transaction([
    prisma.user.findMany({
      where,
      skip: (parseInt(page) - 1) * parseInt(limit),
      take: parseInt(limit),
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        phone: true,
        isActive: true,
        isEmailVerified: true,
        createdAt: true,
        clientProfile: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true,
            companyName: true,
            _count: { select: { bookings: true } },
          },
        },
      },
    }),
    prisma.user.count({ where }),
  ]);

  return sendSuccess(res, "Users list", users, 200, {
    total,
    page: parseInt(page),
    limit: parseInt(limit),
    totalPages: Math.ceil(total / parseInt(limit)),
  });
};

export const toggleUserStatus = async (req: Request, res: Response) => {
  const { id } = req.params;
  const user = await prisma.user.findUnique({ where: { id } });
  if (!user) return sendError(res, "User not found", 404);

  await prisma.user.update({ where: { id }, data: { isActive: !user.isActive } });
  return sendSuccess(res, `User ${user.isActive ? "deactivated" : "activated"}`);
};

export const getPlatformAnalytics = async (req: Request, res: Response) => {
  const { from, to } = req.query as { from?: string; to?: string };

  const dateFilter = {
    gte: from ? new Date(from) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    lte: to ? new Date(to) : new Date(),
  };

  const [
    bookingsByService,
    bookingsByStatus,
    revenueByMonth,
    topCAs,
    bookingTrend,
  ] = await prisma.$transaction([
    prisma.booking.groupBy({
      by: ["serviceId"],
      where: { createdAt: dateFilter },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.booking.groupBy({
      by: ["status"],
      where: { createdAt: dateFilter },
      _count: { id: true },
      orderBy: { _count: { id: "desc" } },
    }),
    prisma.$queryRaw<Array<{ month: string; revenue: number }>>`
      SELECT DATE_FORMAT(createdAt, '%Y-%m') as month, SUM(amount) as revenue
      FROM payments
      WHERE status = 'SUCCESS' AND createdAt BETWEEN ${dateFilter.gte} AND ${dateFilter.lte}
      GROUP BY month ORDER BY month
    `,
    prisma.cAProfessional.findMany({
      orderBy: { totalConsultations: "desc" },
      take: 10,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        totalConsultations: true,
        totalEarnings: true,
        averageRating: true,
      },
    }),
    prisma.$queryRaw<Array<{ date: string; count: number }>>`
      SELECT DATE(createdAt) as date, COUNT(*) as count
      FROM bookings
      WHERE createdAt BETWEEN ${dateFilter.gte} AND ${dateFilter.lte}
      GROUP BY date ORDER BY date
    `,
  ]);

  return sendSuccess(res, "Analytics", {
    bookingsByService,
    bookingsByStatus,
    revenueByMonth,
    topCAs,
    bookingTrend,
  });
};

export const updatePlatformSettings = async (req: Request, res: Response) => {
  const settings: Record<string, string> = req.body;

  const upserts = Object.entries(settings).map(([key, value]) =>
    prisma.platformSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    })
  );

  await prisma.$transaction(upserts);
  return sendSuccess(res, "Settings updated");
};

export const getPlatformSettings = async (req: Request, res: Response) => {
  const settings = await prisma.platformSettings.findMany();
  const map = Object.fromEntries(settings.map((s) => [s.key, s.value]));
  return sendSuccess(res, "Settings", map);
};
