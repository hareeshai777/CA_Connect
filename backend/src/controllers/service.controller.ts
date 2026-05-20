import { Request, Response } from "express";
import { prisma } from "../config/prisma";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const getServices = async (req: Request, res: Response) => {
  const { featured, category } = req.query;

  const where: any = {
    isActive: true,
    ...(featured === "true" && { isFeatured: true }),
    ...(category && { category }),
  };

  const services = await prisma.service.findMany({
    where,
    orderBy: { sortOrder: "asc" },
    include: {
      benefits: true,
      _count: { select: { bookings: true, specializations: true } },
    },
  });

  return sendSuccess(res, "Services", services);
};

export const getServiceBySlug = async (req: Request, res: Response) => {
  const { slug } = req.params;
  const service = await prisma.service.findUnique({
    where: { slug },
    include: {
      benefits: true,
      specializations: {
        where: {
          caProfessional: { status: "ACTIVE", isAvailable: true },
        },
        include: {
          caProfessional: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              avatarUrl: true,
              experienceYears: true,
              consultationFee: true,
              averageRating: true,
              totalReviews: true,
              city: true,
            },
          },
        },
        take: 6,
      },
    },
  });

  if (!service) return sendError(res, "Service not found", 404);
  return sendSuccess(res, "Service details", service);
};

export const createService = async (req: Request, res: Response) => {
  const {
    name,
    slug,
    description,
    shortDescription,
    category,
    basePrice,
    iconUrl,
    isFeatured,
    sortOrder,
    benefits,
    metaTitle,
    metaDescription,
  } = req.body;

  const service = await prisma.service.create({
    data: {
      name,
      slug,
      description,
      shortDescription,
      category,
      basePrice: parseInt(basePrice || "0"),
      iconUrl,
      isFeatured: isFeatured || false,
      sortOrder: parseInt(sortOrder || "0"),
      metaTitle,
      metaDescription,
      benefits: benefits
        ? { create: benefits.map((b: string) => ({ benefit: b })) }
        : undefined,
    },
    include: { benefits: true },
  });

  return sendSuccess(res, "Service created", service, 201);
};

export const updateService = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { benefits, ...data } = req.body;

  const service = await prisma.service.update({
    where: { id },
    data: {
      ...data,
      basePrice: data.basePrice ? parseInt(data.basePrice) : undefined,
      sortOrder: data.sortOrder ? parseInt(data.sortOrder) : undefined,
    },
  });

  if (benefits) {
    await prisma.serviceBenefit.deleteMany({ where: { serviceId: id } });
    await prisma.serviceBenefit.createMany({
      data: benefits.map((b: string) => ({ benefit: b, serviceId: id })),
    });
  }

  return sendSuccess(res, "Service updated", service);
};
