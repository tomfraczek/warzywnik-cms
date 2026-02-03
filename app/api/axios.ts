import axios from "axios";
import { getClerkToken } from "@/app/api/clerkToken";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: false,
});

apiClient.interceptors.request.use(async (config) => {
  const token = await getClerkToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }

  console.log("[apiClient] baseURL:", config.baseURL);
  console.log("[apiClient] url:", config.url);
  console.log(
    "[apiClient] full:",
    `${config.baseURL ?? ""}${config.url ?? ""}`,
  );
  console.log("[apiClient] content-type:", config.headers?.["Content-Type"]);
  console.log("[apiClient] data:", config.data);
  return config;
});

export const unwrapData = <T>(response: { data: T }) => response.data;
