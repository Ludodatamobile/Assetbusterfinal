import { apiData, apiRequest, clearAdminTokens, setAdminTokens } from "@/lib/api";
import type { AdminAccount, AdminLoginResult } from "@/types/admin";

interface LoginPayload {
  email: string;
  password: string;
}

interface BootstrapPayload {
  setupSecret: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
}

interface AdminBootstrapStatus {
  requiresBootstrap: boolean;
  hasActiveAdmin: boolean;
}

type LooseLoginResponse = {
  admin?: AdminAccount;
  user?: AdminAccount;
  accessToken?: string;
  token?: string;
  refreshToken?: string;
  tokens?: {
    accessToken?: string;
    refreshToken?: string;
  };
};

export async function getAdminBootstrapStatus() {
  return apiData<AdminBootstrapStatus>("/admin/auth/bootstrap-status", { skipAuth: true });
}

export async function loginAdmin(payload: LoginPayload): Promise<AdminLoginResult> {
  const data = await apiData<LooseLoginResponse>("/admin/auth/login", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(payload),
  });

  const accessToken = data.accessToken ?? data.token ?? data.tokens?.accessToken;
  const refreshToken = data.refreshToken ?? data.tokens?.refreshToken;

  if (!accessToken) {
    throw new Error("Admin login succeeded, but no access token was returned.");
  }

  setAdminTokens(accessToken, refreshToken);

  return {
    admin: data.admin ?? data.user ?? null,
    accessToken,
    refreshToken,
  };
}

export async function bootstrapSuperAdmin(payload: BootstrapPayload): Promise<AdminLoginResult> {
  const data = await apiData<LooseLoginResponse>("/admin/auth/bootstrap-super-admin", {
    method: "POST",
    skipAuth: true,
    body: JSON.stringify(payload),
  });

  const accessToken = data.accessToken ?? data.token ?? data.tokens?.accessToken;
  const refreshToken = data.refreshToken ?? data.tokens?.refreshToken;

  if (!accessToken) {
    throw new Error("Super admin was created, but no access token was returned.");
  }

  setAdminTokens(accessToken, refreshToken);

  return {
    admin: data.admin ?? data.user ?? null,
    accessToken,
    refreshToken,
  };
}

export async function getCurrentAdmin() {
  return apiData<AdminAccount>("/admin/auth/me");
}

export async function logoutAdmin() {
  try {
    await apiRequest("/admin/auth/logout", { method: "POST" });
  } finally {
    clearAdminTokens();
  }
}