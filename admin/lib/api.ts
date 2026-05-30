import {
  ADMIN_ACCESS_TOKEN_KEY,
  ADMIN_COOKIE_NAME,
  ADMIN_REFRESH_TOKEN_KEY,
  API_BASE_URL,
} from "@/lib/constants";
import type { ApiEnvelope } from "@/types/admin";

type ApiRequestOptions = RequestInit & {
  skipAuth?: boolean;
  timeoutMs?: number;
};

const DEFAULT_REQUEST_TIMEOUT_MS = 15_000;

export class ApiClientError extends Error {
  status: number;
  payload?: unknown;

  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiClientError";
    this.status = status;
    this.payload = payload;
  }
}

export function getAccessToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY);
}

export function getRefreshToken() {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(ADMIN_REFRESH_TOKEN_KEY);
}

export function setAdminTokens(accessToken: string, refreshToken?: string) {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(ADMIN_ACCESS_TOKEN_KEY, accessToken);
  if (refreshToken) window.localStorage.setItem(ADMIN_REFRESH_TOKEN_KEY, refreshToken);
  document.cookie = `${ADMIN_COOKIE_NAME}=1; path=/admin; max-age=${60 * 60 * 24}; SameSite=Lax`;
}

export function clearAdminTokens() {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
  document.cookie = `${ADMIN_COOKIE_NAME}=; path=/admin; max-age=0; SameSite=Lax`;
}

export async function apiRequest<T>(path: string, options: ApiRequestOptions = {}): Promise<ApiEnvelope<T>> {
  const { skipAuth, timeoutMs = DEFAULT_REQUEST_TIMEOUT_MS, signal: externalSignal, ...requestOptions } = options;
  const token = skipAuth ? null : getAccessToken();
  const headers = new Headers(options.headers);
  const controller = new AbortController();
  const timeout = globalThis.setTimeout(() => controller.abort(), timeoutMs);

  const abortFromExternalSignal = () => controller.abort();

  if (externalSignal) {
    if (externalSignal.aborted) controller.abort();
    else externalSignal.addEventListener("abort", abortFromExternalSignal, { once: true });
  }

  if (!headers.has("Content-Type") && requestOptions.body && !(requestOptions.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  if (token) headers.set("Authorization", `Bearer ${token}`);

  let response: Response;

  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...requestOptions,
      headers,
      credentials: "include",
      signal: controller.signal,
    });
  } catch (error) {
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiClientError("Server did not respond. Please check the backend and try again.", 0, error);
    }

    throw new ApiClientError("Unable to reach the server. Please check the backend connection.", 0, error);
  } finally {
    globalThis.clearTimeout(timeout);
    externalSignal?.removeEventListener("abort", abortFromExternalSignal);
  }

  const payload = await response.json().catch(() => null);
  const envelope = normalizeEnvelope<T>(payload);

  if (!response.ok || envelope.success === false) {
    throw new ApiClientError(
      envelope.error || envelope.message || `Request failed with status ${response.status}`,
      response.status,
      payload
    );
  }

  return envelope;
}

export async function apiData<T>(path: string, options: ApiRequestOptions = {}) {
  const response = await apiRequest<T>(path, options);
  return response.data as T;
}

export function normalizeEnvelope<T>(payload: unknown): ApiEnvelope<T> {
  if (payload && typeof payload === "object" && "success" in payload) {
    return payload as ApiEnvelope<T>;
  }

  return {
    success: true,
    data: payload as T,
  };
}