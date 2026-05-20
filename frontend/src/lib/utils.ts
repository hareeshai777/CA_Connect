import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const formatCurrency = (amount: number, currency = "INR") =>
  new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 0 }).format(
    amount / 100
  );

export const formatDate = (date: string | Date, opts?: Intl.DateTimeFormatOptions) =>
  new Intl.DateTimeFormat("en-IN", opts || { dateStyle: "medium" }).format(new Date(date));

export const formatDateTime = (date: string | Date) =>
  new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(date)
  );

export const truncate = (str: string, n: number) =>
  str.length > n ? str.slice(0, n - 1) + "…" : str;

export const getInitials = (firstName: string, lastName?: string) =>
  `${firstName[0]}${lastName?.[0] || ""}`.toUpperCase();

export const slugify = (text: string) =>
  text.toLowerCase().replace(/\s+/g, "-").replace(/[^\w-]+/g, "");
