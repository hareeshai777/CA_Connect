import { Request, Response } from "express";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import { prisma } from "../config/prisma";
import { env } from "../config/env";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt";
import { generateOTP, otpExpiresAt } from "../utils/otp";
import { sendSuccess, sendError } from "../utils/apiResponse";
import { sendEmail, emailTemplates } from "../services/email.service";
import { AppError } from "../middleware/errorHandler";

const googleClient = new OAuth2Client(env.GOOGLE_CLIENT_ID);

const issueTokens = (user: { id: string; email: string; role: string }) => ({
  accessToken: generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  }),
  refreshToken: generateRefreshToken({
    userId: user.id,
    email: user.email,
    role: user.role,
  }),
});

export const register = async (req: Request, res: Response) => {
  const { email, password, phone, firstName, lastName, role = "CLIENT" } = req.body;

  const exists = await prisma.user.findFirst({
    where: { OR: [{ email }, { phone: phone || undefined }] },
  });
  if (exists) return sendError(res, "Email or phone already registered", 409);

  const passwordHash = await bcrypt.hash(password, 12);
  const otp = generateOTP();

  const user = await prisma.user.create({
    data: {
      email,
      phone,
      passwordHash,
      role: role as any,
      otpCode: otp,
      otpExpiresAt: otpExpiresAt(10),
    },
  });

  if (role === "CLIENT") {
    await prisma.clientProfile.create({
      data: { userId: user.id, firstName, lastName },
    });
  } else if (role === "ASSISTANCE_TEAM") {
    await prisma.assistanceMember.create({
      data: { userId: user.id, firstName, lastName },
    });
  }

  await sendEmail({
    to: email,
    ...emailTemplates.otpVerification(otp, firstName),
  });

  return sendSuccess(
    res,
    "Registration successful. Please verify your email.",
    { userId: user.id },
    201
  );
};

export const verifyOTP = async (req: Request, res: Response) => {
  const { userId, otp } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) return sendError(res, "User not found", 404);
  if (!user.otpCode || user.otpCode !== otp)
    return sendError(res, "Invalid OTP", 400);
  if (!user.otpExpiresAt || user.otpExpiresAt < new Date())
    return sendError(res, "OTP expired", 400);

  await prisma.user.update({
    where: { id: userId },
    data: { isEmailVerified: true, otpCode: null, otpExpiresAt: null },
  });

  return sendSuccess(res, "Email verified successfully");
};

export const resendOTP = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return sendError(res, "User not found", 404);

  const otp = generateOTP();
  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: otp, otpExpiresAt: otpExpiresAt(10) },
  });

  const profile = await prisma.clientProfile.findUnique({
    where: { userId: user.id },
  });
  await sendEmail({
    to: email,
    ...emailTemplates.otpVerification(otp, profile?.firstName || "User"),
  });

  return sendSuccess(res, "OTP resent successfully");
};

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body;

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !user.passwordHash)
    return sendError(res, "Invalid credentials", 401);
  if (!user.isActive) return sendError(res, "Account is deactivated", 403);

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return sendError(res, "Invalid credentials", 401);

  const { accessToken, refreshToken } = issueTokens(user);

  await prisma.user.update({
    where: { id: user.id },
    data: { refreshToken },
  });

  return sendSuccess(res, "Login successful", {
    accessToken,
    refreshToken,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  });
};

export const googleSignIn = async (req: Request, res: Response) => {
  const { credential } = req.body;

  const ticket = await googleClient.verifyIdToken({
    idToken: credential,
    audience: env.GOOGLE_CLIENT_ID,
  });
  const payload = ticket.getPayload();
  if (!payload?.email) return sendError(res, "Invalid Google token", 400);

  let user = await prisma.user.findFirst({
    where: { OR: [{ googleId: payload.sub }, { email: payload.email }] },
  });

  if (!user) {
    user = await prisma.user.create({
      data: {
        email: payload.email,
        googleId: payload.sub,
        isEmailVerified: true,
        role: "CLIENT",
        clientProfile: {
          create: {
            firstName: payload.given_name || "User",
            lastName: payload.family_name || "",
            avatarUrl: payload.picture,
          },
        },
      },
    });
  } else if (!user.googleId) {
    user = await prisma.user.update({
      where: { id: user.id },
      data: { googleId: payload.sub, isEmailVerified: true },
    });
  }

  const { accessToken, refreshToken } = issueTokens(user);
  await prisma.user.update({ where: { id: user.id }, data: { refreshToken } });

  return sendSuccess(res, "Google sign-in successful", {
    accessToken,
    refreshToken,
    role: user.role,
    isEmailVerified: user.isEmailVerified,
  });
};

export const refreshToken = async (req: Request, res: Response) => {
  const { refreshToken: token } = req.body;
  if (!token) return sendError(res, "Refresh token required", 400);

  try {
    const payload = verifyRefreshToken(token);
    const user = await prisma.user.findUnique({ where: { id: payload.userId } });

    if (!user || user.refreshToken !== token)
      return sendError(res, "Invalid refresh token", 401);

    const tokens = issueTokens(user);
    await prisma.user.update({
      where: { id: user.id },
      data: { refreshToken: tokens.refreshToken },
    });

    return sendSuccess(res, "Tokens refreshed", tokens);
  } catch {
    return sendError(res, "Invalid refresh token", 401);
  }
};

export const logout = async (req: Request, res: Response) => {
  if (req.user) {
    await prisma.user.update({
      where: { id: req.user.userId },
      data: { refreshToken: null },
    });
  }
  return sendSuccess(res, "Logged out successfully");
};

export const forgotPassword = async (req: Request, res: Response) => {
  const { email } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user) {
    return sendSuccess(res, "If that email exists, a reset link has been sent.");
  }

  const resetToken = generateOTP(6);
  const resetExpiry = otpExpiresAt(60);

  await prisma.user.update({
    where: { id: user.id },
    data: { otpCode: resetToken, otpExpiresAt: resetExpiry },
  });

  const resetLink = `${env.FRONTEND_URL}/auth/reset-password?token=${resetToken}&userId=${user.id}`;
  const profile = await prisma.clientProfile.findUnique({ where: { userId: user.id } });

  await sendEmail({
    to: email,
    ...emailTemplates.passwordReset(resetLink, profile?.firstName || "User"),
  });

  return sendSuccess(res, "If that email exists, a reset link has been sent.");
};

export const resetPassword = async (req: Request, res: Response) => {
  const { userId, token, newPassword } = req.body;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || user.otpCode !== token)
    return sendError(res, "Invalid or expired reset token", 400);
  if (!user.otpExpiresAt || user.otpExpiresAt < new Date())
    return sendError(res, "Reset token expired", 400);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash, otpCode: null, otpExpiresAt: null, refreshToken: null },
  });

  return sendSuccess(res, "Password reset successfully");
};

export const changePassword = async (req: Request, res: Response) => {
  const { currentPassword, newPassword } = req.body;
  const userId = req.user!.userId;

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user || !user.passwordHash) return sendError(res, "User not found", 404);

  const valid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!valid) return sendError(res, "Current password is incorrect", 400);

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: userId }, data: { passwordHash } });

  return sendSuccess(res, "Password changed successfully");
};

export const getMe = async (req: Request, res: Response) => {
  const user = await prisma.user.findUnique({
    where: { id: req.user!.userId },
    select: {
      id: true,
      email: true,
      phone: true,
      role: true,
      isEmailVerified: true,
      isPhoneVerified: true,
      createdAt: true,
      clientProfile: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          companyName: true,
        },
      },
      caProfessional: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          status: true,
          isAvailable: true,
        },
      },
      assistanceMember: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          avatarUrl: true,
          designation: true,
          department: true,
          isActive: true,
        },
      },
      admin: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        },
      },
    },
  });

  if (!user) return sendError(res, "User not found", 404);
  return sendSuccess(res, "Profile fetched", user);
};
