import { storage } from "@/libs/storage";
import type { AxiosInstance } from "axios";
import axios, { AxiosError } from "axios";
import { router } from "expo-router";

const defaultHeaders: Record<string, string> = {
  "x-localization": "en",
  Accept: "application/json",
  "Content-Type": "application/json",
};

const $axios: AxiosInstance = axios.create({
  baseURL: process.env.EXPO_PUBLIC_API_BASE_URL,
  headers: defaultHeaders,
});

$axios.interceptors.request.use(async (config) => {
  const token = await storage.getToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  if (config.data instanceof FormData) {
    delete config.headers["Content-Type"];
  }

  return config;
});

$axios.interceptors.response.use(
  (response) => response,
  async (error: AxiosError<{ message?: string }>) => {
    const status = error.response?.status ?? 0;
    const url = error.config?.url ?? "";
    const data = error.response?.data ?? {};

    const shouldLogout =
      url !== "login" &&
      (status === 401 ||
        data?.message?.includes("Unauthenticated.") ||
        data?.message?.includes("invalid token."));

    if (shouldLogout) {
      await storage.clear();
      router.replace("/sign-in");
    }

    return Promise.reject(error);
  },
);

export default $axios;
