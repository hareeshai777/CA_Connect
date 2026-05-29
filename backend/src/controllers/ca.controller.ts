import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { uploadToCloudinary } from "../middleware/upload";

export const registerCA = async (req: Request, res: Response) => {
  const {
    firstName,
    lastName,
    bio,
    membershipNumber,
    experienceYears,
    consultationFee,
    city,
    state,
    languages,
    specializations,
  } = req.body;

  const userId = req.user!.userId;

  const existing = await prisma.cAProfessional.findUnique({ where: { userId } });
  if (existing) return sendError(res, "CA profile already exists", 409);

  const ca = await prisma.cAProfessional.create({
    data: {
      userId,
      firstName,
      lastName,
      bio,
      membershipNumber,
      experienceYears: parseInt(experienceYears) || 0,
      consultationFee: parseInt(consultationFee) || 49900,
      city,
      state,
      languages,
      // Always start at PENDING_APPROVAL — admin reviews before activating
      status: "PENDING_APPROVAL",
    },
  });

  if (specializations && Array.isArray(specializations)) {
    await prisma.cASpecialization.createMany({
      data: specializations.map((serviceId: string) => ({
        caProfessionalId: ca.id,
        serviceId,
      })),
    });
  }

  // Registration complete — admin reviews and approves
  return sendSuccess(res, "CA profile created. Account is under admin review.", {
    caId: ca.id,
    demoMode: true,
  }, 201);
};

export const uploadCADocuments = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const ca = await prisma.cAProfessional.findUnique({ where: { userId } });
  if (!ca) return sendError(res, "CA profile not found", 404);

  const files = req.files as Express.Multer.File[];
  if (!files || files.length === 0) return sendError(res, "No files provided", 400);

  const uploaded = await Promise.all(
    files.map(async (file) => {
      const { url, publicId } = await uploadToCloudinary(
        file.buffer,
        "ca-documents",
        "auto"
      );
      return prisma.document.create({
        data: {
          name: file.originalname,
          fileUrl: url,
          filePublicId: publicId,
          fileSize: file.size,
          mimeType: file.mimetype,
          type: "CA_CERTIFICATE",
          caProfessionalId: ca.id,
        },
      });
    })
  );

  return sendSuccess(res, "Documents uploaded", uploaded);
};

export const uploadAvatar = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const file = req.file;
  if (!file) return sendError(res, "No file provided", 400);

  const { url } = await uploadToCloudinary(file.buffer, "ca-avatars", "image");

  const ca = await prisma.cAProfessional.update({
    where: { userId },
    data: { avatarUrl: url },
  });

  return sendSuccess(res, "Avatar uploaded", { avatarUrl: ca.avatarUrl });
};

export const getCAProfile = async (req: Request, res: Response) => {
  const { id } = req.params;
  const ca = await prisma.cAProfessional.findUnique({
    where: { id },
    include: {
      user: { select: { email: true, phone: true } },
      specializations: { include: { service: true } },
      reviews: {
        where: { isPublished: true },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: {
          clientProfile: { select: { firstName: true, lastName: true, avatarUrl: true } },
        },
      },
      timeSlots: {
        where: { isBooked: false, isBlocked: false, date: { gte: new Date() } },
        orderBy: { date: "asc" },
        take: 30,
      },
      _count: { select: { bookings: true, reviews: true } },
    },
  });

  if (!ca) return sendError(res, "CA not found", 404);
  return sendSuccess(res, "CA profile", ca);
};

export const getMyCAProfile = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const ca = await prisma.cAProfessional.findUnique({
    where: { userId },
    include: {
      user: { select: { email: true, phone: true } },
      specializations: { include: { service: true } },
      documents: true,
      subscription: true,
    },
  });

  if (!ca) return sendError(res, "CA profile not found", 404);
  return sendSuccess(res, "CA profile", ca);
};

export const updateCAProfile = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const {
    bio,
    experienceYears,
    consultationFee,
    city,
    state,
    languages,
    isAvailable,
    specializations,
  } = req.body;

  const ca = await prisma.cAProfessional.update({
    where: { userId },
    data: {
      bio,
      experienceYears: experienceYears ? parseInt(experienceYears) : undefined,
      consultationFee: consultationFee ? parseInt(consultationFee) : undefined,
      city,
      state,
      languages,
      isAvailable: isAvailable !== undefined ? isAvailable : undefined,
    },
  });

  if (specializations && Array.isArray(specializations)) {
    await prisma.cASpecialization.deleteMany({ where: { caProfessionalId: ca.id } });
    await prisma.cASpecialization.createMany({
      data: specializations.map((serviceId: string) => ({
        caProfessionalId: ca.id,
        serviceId,
      })),
    });
  }

  return sendSuccess(res, "Profile updated", ca);
};

export const listCAs = async (req: Request, res: Response) => {
  const {
    page = "1",
    limit = "12",
    service,
    city,
    minFee,
    maxFee,
    minRating,
    search,
    sortBy = "averageRating",
  } = req.query as Record<string, string>;

  const skip = (parseInt(page) - 1) * parseInt(limit);

  const where: any = {
    status: "ACTIVE",
    isAvailable: true,
    ...(city && { city: { contains: city, mode: "insensitive" } }),
    ...(minFee && { consultationFee: { gte: parseInt(minFee) } }),
    ...(maxFee && { consultationFee: { ...((minFee && { gte: parseInt(minFee) }) || {}), lte: parseInt(maxFee) } }),
    ...(minRating && { averageRating: { gte: parseFloat(minRating) } }),
    ...(search && {
      OR: [
        { firstName: { contains: search, mode: "insensitive" } },
        { lastName: { contains: search, mode: "insensitive" } },
        { bio: { contains: search, mode: "insensitive" } },
      ],
    }),
    ...(service && {
      specializations: { some: { service: { slug: service } } },
    }),
  };

  const [cas, total] = await prisma.$transaction([
    prisma.cAProfessional.findMany({
      where,
      skip,
      take: parseInt(limit),
      orderBy: [{ [sortBy]: "desc" }],
      select: {
        id: true,
        firstName: true,
        lastName: true,
        bio: true,
        experienceYears: true,
        consultationFee: true,
        avatarUrl: true,
        city: true,
        state: true,
        languages: true,
        averageRating: true,
        totalReviews: true,
        totalConsultations: true,
        isAvailable: true,
        specializations: {
          select: { service: { select: { name: true, slug: true } } },
        },
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

export const getCATimeSlots = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { date } = req.query as { date?: string };

  const where: any = {
    caProfessionalId: id,
    isBooked: false,
    isBlocked: false,
  };

  if (date) {
    const d = new Date(date);
    const nextDay = new Date(d);
    nextDay.setUTCDate(nextDay.getUTCDate() + 1);
    where.date = { gte: d, lt: nextDay };
  } else {
    where.date = { gte: new Date() };
  }

  const slots = await prisma.timeSlot.findMany({
    where,
    orderBy: [{ date: "asc" }, { startTime: "asc" }],
  });

  return sendSuccess(res, "Time slots", slots);
};

export const manageTimeSlots = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { slots } = req.body;

  const ca = await prisma.cAProfessional.findUnique({ where: { userId } });
  if (!ca) return sendError(res, "CA profile not found", 404);

  const created = await prisma.timeSlot.createMany({
    data: slots.map((s: { date: string; startTime: string; endTime: string }) => ({
      caProfessionalId: ca.id,
      date: new Date(s.date),
      startTime: s.startTime,
      endTime: s.endTime,
    })),
    skipDuplicates: true,
  });

  return sendSuccess(res, "Time slots added", { count: created.count });
};

export const deleteTimeSlot = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const { id } = req.params;

  const ca = await prisma.cAProfessional.findUnique({ where: { userId } });
  if (!ca) return sendError(res, "CA profile not found", 404);

  const slot = await prisma.timeSlot.findFirst({
    where: { id, caProfessionalId: ca.id },
  });
  if (!slot) return sendError(res, "Slot not found", 404);
  if (slot.isBooked) return sendError(res, "Cannot delete a booked slot", 400);

  await prisma.timeSlot.delete({ where: { id } });
  return sendSuccess(res, "Slot deleted");
};

export const getCADashboardStats = async (req: Request, res: Response) => {
  const userId = req.user!.userId;
  const ca = await prisma.cAProfessional.findUnique({ where: { userId } });
  if (!ca) return sendError(res, "CA profile not found", 404);

  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [
    totalBookings,
    pendingBookings,
    completedBookings,
    thisMonthBookings,
    totalEarnings,
    thisMonthEarnings,
    recentBookings,
    upcomingBookings,
  ] = await prisma.$transaction([
    prisma.booking.count({ where: { caProfessionalId: ca.id } }),
    prisma.booking.count({ where: { caProfessionalId: ca.id, status: "CONFIRMED" } }),
    prisma.booking.count({ where: { caProfessionalId: ca.id, status: "COMPLETED" } }),
    prisma.booking.count({
      where: { caProfessionalId: ca.id, createdAt: { gte: startOfMonth } },
    }),
    prisma.earning.aggregate({
      where: { caProfessionalId: ca.id },
      _sum: { netAmount: true },
    }),
    prisma.earning.aggregate({
      where: { caProfessionalId: ca.id, createdAt: { gte: startOfMonth } },
      _sum: { netAmount: true },
    }),
    prisma.booking.findMany({
      where: { caProfessionalId: ca.id },
      orderBy: { createdAt: "desc" },
      take: 5,
      include: {
        clientProfile: { select: { firstName: true, lastName: true, avatarUrl: true } },
        service: { select: { name: true } },
        timeSlot: true,
      },
    }),
    prisma.booking.findMany({
      where: {
        caProfessionalId: ca.id,
        status: "CONFIRMED",
        scheduledAt: { gte: now },
      },
      orderBy: { scheduledAt: "asc" },
      take: 5,
      include: {
        clientProfile: { select: { firstName: true, lastName: true, avatarUrl: true } },
        service: { select: { name: true } },
      },
    }),
  ]);

  return sendSuccess(res, "Dashboard stats", {
    totalBookings,
    pendingBookings,
    completedBookings,
    thisMonthBookings,
    totalEarnings: totalEarnings._sum.netAmount || 0,
    thisMonthEarnings: thisMonthEarnings._sum.netAmount || 0,
    averageRating: ca.averageRating,
    totalReviews: ca.totalReviews,
    recentBookings,
    upcomingBookings,
  });
};
