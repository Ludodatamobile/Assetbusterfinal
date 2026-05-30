import type { ApiEnvelope, PaginationMeta } from "@/types/admin";

export function rowsFromEnvelope<T>(envelope: ApiEnvelope<T[] | { data?: T[]; pagination?: PaginationMeta }>) {
  const data = envelope.data;
  if (Array.isArray(data)) return data;
  return data?.data ?? [];
}

export function metaFromEnvelope<T>(envelope: ApiEnvelope<T[] | { data?: T[]; pagination?: PaginationMeta }>) {
  const nested = !Array.isArray(envelope.data) ? envelope.data?.pagination : undefined;
  return (envelope.meta as PaginationMeta | undefined) ?? nested;
}

export function statValue(source: Record<string, unknown> | undefined, keys: string[], fallback = 0) {
  for (const key of keys) {
    const value = source?.[key];
    if (value !== undefined && value !== null) return value as number | string;
  }
  return fallback;
}