/**
 * Centralized token management for both user and admin authentication
 */

const ADMIN_TOKEN_KEY = "admin_access_token";
const USER_TOKEN_KEY = "accessToken";
const REFRESH_TOKEN_KEY = "refreshToken";

export const getAdminToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(ADMIN_TOKEN_KEY);
};

export const setAdminToken = (token: string | null): void => {
  if (typeof window === "undefined") return;
  if (!token) {
    localStorage.removeItem(ADMIN_TOKEN_KEY);
  } else {
    localStorage.setItem(ADMIN_TOKEN_KEY, token);
  }
};

export const getUserToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(USER_TOKEN_KEY);
};

export const setUserToken = (token: string | null): void => {
  if (typeof window === "undefined") return;
  if (!token) {
    localStorage.removeItem(USER_TOKEN_KEY);
  } else {
    localStorage.setItem(USER_TOKEN_KEY, token);
  }
};

export const getRefreshToken = (): string | null => {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

export const setRefreshToken = (token: string | null): void => {
  if (typeof window === "undefined") return;
  if (!token) {
    localStorage.removeItem(REFRESH_TOKEN_KEY);
  } else {
    localStorage.setItem(REFRESH_TOKEN_KEY, token);
  }
};

export const clearAllTokens = (): void => {
  if (typeof window === "undefined") return;
  localStorage.removeItem(ADMIN_TOKEN_KEY);
  localStorage.removeItem(USER_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

export const isAdminAuthenticated = (): boolean => {
  return !!getAdminToken();
};

export const isUserAuthenticated = (): boolean => {
  return !!getUserToken();
};
