import Razorpay from "razorpay";
import { env } from "./env";

// env values are non-null asserted in TypeScript but may be undefined/empty at runtime
// when deployment env vars aren't configured. Guard construction to prevent server crash.
const keyId = env.RAZORPAY_KEY_ID as string | undefined;
const keySecret = env.RAZORPAY_KEY_SECRET as string | undefined;
const isConfigured = !!(keyId && keySecret && keyId !== "rzp_test_");

export const razorpay: Razorpay | null = isConfigured
  ? new Razorpay({ key_id: keyId!, key_secret: keySecret! })
  : null;

if (!isConfigured) {
  console.warn("[Razorpay] Credentials not configured — payment features running in demo mode");
}
