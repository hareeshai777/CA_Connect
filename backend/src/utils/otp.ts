import crypto from "crypto";

export const generateOTP = (length = 6): string =>
  crypto
    .randomInt(0, Math.pow(10, length))
    .toString()
    .padStart(length, "0");

export const otpExpiresAt = (minutes = 10): Date => {
  const d = new Date();
  d.setMinutes(d.getMinutes() + minutes);
  return d;
};
