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

  let payload: ReturnType<typeof verifyAccessToken>;
  try {
    payload = verifyAccessToken(token);
  } catch {
    return sendError(res, "Invalid or expired token", 401);
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: { id: true, isActive: true, role: true },
    });
    if (!user) return sendError(res, "User not found", 401);
    if (!user.isActive) return sendError(res, "Account is deactivated — contact support", 401);

    // Use the DB role (authoritative) rather than the stale JWT role
    req.user = { ...payload, role: user.role, isActive: user.isActive };
    next();
  } catch (dbErr) {
    // DB unavailable (cold start, etc.) — fall back to JWT-only auth so dashboards stay usable
    req.user = { ...payload, isActive: true };
    next();
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
