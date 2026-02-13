import axios, { type AxiosError } from "axios";

type AuthTokenProvider = () => Promise<string | null | undefined>;
export type UnauthorizedHandler = (error: AxiosError) => void | Promise<void>;

let authTokenProvider: AuthTokenProvider | null = null;
let unauthorizedHandler: UnauthorizedHandler | null = null;

export const setAuthTokenProvider = (provider: AuthTokenProvider | null) => {
  authTokenProvider = provider;
};

export const setUnauthorizedHandler = (handler: UnauthorizedHandler | null) => {
  unauthorizedHandler = handler;
};

const handleUnauthorized = async (error: AxiosError) => {
  if (typeof window === "undefined") return;
  if (unauthorizedHandler) {
    try {
      await unauthorizedHandler(error);
      return;
    } catch {
      // fall through to redirect
    }
  }
  window.location.assign("/sign-in");
};

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: false,
});

apiClient.interceptors.request.use(async (config) => {
  if (typeof window === "undefined") return config;
  const token = authTokenProvider ? await authTokenProvider() : null;
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

apiClient.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const status = error.response?.status;
    if (status === 401 || status === 403) {
      await handleUnauthorized(error);
    }
    return Promise.reject(error);
  },
);

export const unwrapData = <T>(response: { data: T }) => response.data;
