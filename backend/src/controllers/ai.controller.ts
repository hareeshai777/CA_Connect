import { Request, Response } from "express";
import { geminiService } from "../services/gemini.service";
import { prisma } from "../config/prisma";
import { sendSuccess, sendError } from "../utils/apiResponse";

export const chat = async (req: Request, res: Response) => {
  const { message } = req.body;
  if (!message) return sendError(res, "Message required", 400);

  const response = await geminiService.chat(message);
  return sendSuccess(res, "AI response", { message: response });
};

export const getCARecommendations = async (req: Request, res: Response) => {
  const { needs, serviceId } = req.body;

  const cas = await prisma.cAProfessional.findMany({
    where: {
      status: "ACTIVE",
      isAvailable: true,
      ...(serviceId && {
        specializations: { some: { serviceId } },
      }),
    },
    take: 10,
    select: {
      id: true,
      firstName: true,
      lastName: true,
      experienceYears: true,
      averageRating: true,
      specializations: {
        select: { service: { select: { name: true } } },
      },
    },
  });

  const caList = cas.map((ca) => ({
    name: `${ca.firstName} ${ca.lastName}`,
    specializations: ca.specializations.map((s) => s.service.name),
    experience: ca.experienceYears,
    rating: ca.averageRating,
  }));

  const recommendation = await geminiService.recommendCAs(needs, caList);

  return sendSuccess(res, "CA recommendations", {
    recommendation,
    cas: cas.map((ca) => ({
      id: ca.id,
      name: `${ca.firstName} ${ca.lastName}`,
      experience: ca.experienceYears,
      rating: ca.averageRating,
    })),
  });
};

export const analyzeDocument = async (req: Request, res: Response) => {
  const { documentContent, documentType } = req.body;
  if (!documentContent) return sendError(res, "Document content required", 400);

  const analysis = await geminiService.analyzeDocument(documentContent, documentType || "financial document");
  return sendSuccess(res, "Document analysis", { analysis });
};

export const getComplianceSuggestions = async (req: Request, res: Response) => {
  const { businessType, turnover, industry } = req.body;

  const suggestions = await geminiService.generateComplianceSuggestions({
    type: businessType,
    turnover,
    industry,
  });

  return sendSuccess(res, "Compliance suggestions", { suggestions });
};

export const taxFAQ = async (req: Request, res: Response) => {
  const { question } = req.body;
  if (!question) return sendError(res, "Question required", 400);

  const answer = await geminiService.answerTaxFAQ(question);
  return sendSuccess(res, "FAQ answer", { answer });
};
