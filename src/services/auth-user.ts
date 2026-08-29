import $axios from "@/libs/axios";
import type {
  LoginPayload,
  LoginResponse,
  LogoutResponse,
} from "@/types/auth-user-type";

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  password: string;
  password_confirmation: string;
}

export const login = async (user: LoginPayload): Promise<LoginResponse> => {
  const { data } = await $axios.post<LoginResponse>("login", user);

  if (data.data.token) {
    $axios.defaults.headers.common.Authorization = `Bearer ${data.data.token}`;
  }

  return data;
};

export const forgotPassword = async (
  payload: ForgotPasswordPayload,
): Promise<void> => {
  return await $axios.post("forgot-password", payload);
};

export const resetPassword = async (
  payload: ResetPasswordPayload,
): Promise<void> => {
  await $axios.post("reset-password", payload);
};

export const logout = async (): Promise<LogoutResponse> => {
  const { data } = await $axios.post<LogoutResponse>("logout");
  delete $axios.defaults.headers.common.Authorization;
  return data;
};

export const createUser = async (user: Record<string, unknown>) => {
  return await $axios.post(`users`, user);
};

export const updateUser = async ({
  id,
  user,
}: {
  id: string | number;
  user: Record<string, unknown>;
}) => {
  return await $axios.patch(`users/${id}`, user);
};

export const deleteUserById = async (id: string | number) => {
  return await $axios.delete(`users/${id}`);
};
