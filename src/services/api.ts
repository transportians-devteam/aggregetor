import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const baseURL = import.meta.env.VITE_API_URL ?? "http://localhost:8081/api/v1";

export const ACCESS_TOKEN_KEY = "gacp_access_token";
export const REFRESH_TOKEN_KEY = "gacp_refresh_token";
export const AUTH_STORAGE_KEY = "gacp_auth";

const api = axios.create({ baseURL });
const refreshClient = axios.create({ baseURL });

let refreshPromise: Promise<string> | null = null;

function clearSession() {
  localStorage.removeItem(ACCESS_TOKEN_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
  localStorage.removeItem(AUTH_STORAGE_KEY);
  window.dispatchEvent(new Event("gacp-session-cleared"));
}

api.interceptors.request.use((config) => {
  const token = localStorage.getItem(ACCESS_TOKEN_KEY);
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as
      | (InternalAxiosRequestConfig & { _retried?: boolean })
      | undefined;
    if (
      error.response?.status !== 401 ||
      !original ||
      original._retried ||
      original.url?.includes("/auth/refresh")
    ) {
      return Promise.reject(error);
    }

    const refreshToken = localStorage.getItem(REFRESH_TOKEN_KEY);
    if (!refreshToken) {
      clearSession();
      return Promise.reject(error);
    }

    original._retried = true;
    refreshPromise ??= refreshClient
      .post("/auth/refresh", { refreshToken })
      .then(({ data }) => {
        localStorage.setItem(ACCESS_TOKEN_KEY, data.accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, data.refreshToken);
        window.dispatchEvent(
          new CustomEvent("gacp-token-refreshed", { detail: data }),
        );
        return data.accessToken as string;
      })
      .catch((refreshError) => {
        clearSession();
        throw refreshError;
      })
      .finally(() => {
        refreshPromise = null;
      });

    const token = await refreshPromise;
    original.headers.Authorization = `Bearer ${token}`;
    return api.request(original);
  },
);

export function getErrorMessage(
  error: unknown,
  fallback = "The request could not be completed.",
): string {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as
      | { detail?: string; message?: string }
      | undefined;
    return data?.detail ?? data?.message ?? fallback;
  }
  return error instanceof Error ? error.message : fallback;
}

export function idempotencyKey(prefix: string): string {
  return `${prefix}-${crypto.randomUUID()}`;
}

export default api;
