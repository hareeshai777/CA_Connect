import { Request, Response, NextFunction } from "express";
import { verifyAccessToken, JwtPayload } from "../utils/jwt";
import { sendError } from "../utils/apiResponse";
import { prisma } from "../config/prisma";

declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload & { isActive?: boolean };
    }
  }
}

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith("Bearer ")) {
    return sendError(res, "No token provided", 401);
  }
  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyAccessToken(token);
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true, role: true },
    });
    if (!user || !user.isActive) {
      return sendError(res, "Account not found or deactivated", 401);
    }
    req.user = { ...payload, isActive: user.isActive };
    next();
  } catch {
    return sendError(res, "Invalid or expired token", 401);
  }
};

export const authorize = (...roles: string[]) =>
  (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) return sendError(res, "Unauthorized", 401);
    if (!roles.includes(req.user.role)) {
      return sendError(res, "Forbidden: insufficient permissions", 403);
    }
    next();
  };
