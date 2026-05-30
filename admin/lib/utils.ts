import clsx, { type ClassValue } from "clsx";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function formatDate(value?: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatShortDate(value?: string | null) {
  if (!value) return "Not available";
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

export function formatNumber(value?: number | string | null) {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return "0";
  return new Intl.NumberFormat("en", { maximumFractionDigits: 0 }).format(numeric);
}

export function formatCurrency(value?: number | string | null, currency = "USD") {
  const numeric = Number(value ?? 0);
  if (!Number.isFinite(numeric)) return `${currency} 0`;
  try {
    return new Intl.NumberFormat("en", {
      style: "currency",
      currency,
      maximumFractionDigits: 0,
    }).format(numeric);
  } catch {
    return `${currency} ${formatNumber(numeric)}`;
  }
}

export function initials(firstName?: string | null, lastName?: string | null, fallback?: string) {
  const value = `${firstName?.[0] ?? ""}${lastName?.[0] ?? ""}`.trim();
  return (value || fallback?.slice(0, 2) || "AB").toUpperCase();
}

export function titleCase(value?: string | null) {
  if (!value) return "Not available";
  return value
    .replaceAll("_", " ")
    .toLowerCase()
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

export function toQueryString(params: object) {
  const query = new URLSearchParams();
  const entries = Object.entries(params) as Array<[string, string | number | boolean | undefined | null]>;

  entries.forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") query.set(key, String(value));
  });

  const text = query.toString();
  return text ? `?${text}` : "";
}