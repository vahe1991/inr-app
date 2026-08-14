import $axios from "@/libs/axios";
import type {
  LoginPayload,
  LoginResponse,
  LogoutResponse,
} from "@/types/auth-user-type";

export const login = async (user: LoginPayload): Promise<LoginResponse> => {
  const { data } = await $axios.post<LoginResponse>("login", user);

  if (data.data.token) {
    $axios.defaults.headers.common.Authorization = `Bearer ${data.data.token}`;
  }

  return data;
};

export const logout = async (): Promise<LogoutResponse> => {
  return await $axios.post("logout");
};
