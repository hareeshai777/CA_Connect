import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(
    amount / 100
  );

// All dates displayed in IST (UTC+5:30)
const IST = "Asia/Kolkata";

export const formatDate = (date: string | Date | null | undefined, opts?: Intl.DateTimeFormatOptions) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { timeZone: IST, ...(opts || { dateStyle: "medium" }) }).format(d);
};

export const formatDateTime = (date: string | Date | null | undefined) => {
  if (!date) return "—";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "—";
  return new Intl.DateTimeFormat("en-IN", { timeZone: IST, dateStyle: "medium", timeStyle: "short" }).format(d);
};

export const truncate = (str: string, n: number) =>
  str.length > n ? str.slice(0, n - 1) + "…" : str;

export const getInitials = (firstName: string, lastName?: string) =>
  `${firstName?.[0] || ""}${lastName?.[0] || ""}`.toUpperCase() || "?";

export const slugify = (text: string) =>
  text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
