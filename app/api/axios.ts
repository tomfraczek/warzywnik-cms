import axios from "axios";

export const apiClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  withCredentials: false,
});

apiClient.interceptors.request.use((config) => {
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
