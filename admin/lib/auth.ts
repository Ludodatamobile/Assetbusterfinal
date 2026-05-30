import {
  ADMIN_ACCESS_TOKEN_KEY,
  ADMIN_COOKIE_NAME,
  ADMIN_REFRESH_TOKEN_KEY,
} from "@/lib/constants";

export function hasAdminSession() {
  if (typeof window === "undefined") return false;
  return Boolean(window.localStorage.getItem(ADMIN_ACCESS_TOKEN_KEY));
}

export function clearAdminSession() {
  if (typeof window === "undefined") return;

  window.localStorage.removeItem(ADMIN_ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(ADMIN_REFRESH_TOKEN_KEY);
  document.cookie = `${ADMIN_COOKIE_NAME}=; path=/; max-age=0; SameSite=Lax`;
}