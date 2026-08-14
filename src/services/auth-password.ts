import $axios from "@/libs/axios";

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  token: string;
  password: string;
  password_confirmation: string;
}

const delay = (ms = 500) => new Promise((r) => setTimeout(r, ms));

export async function requestPasswordReset(
  payload: ForgotPasswordPayload,
): Promise<void> {
  try {
    await $axios.post("forgot-password", payload);
  } catch {
    await delay();
  }
}

export async function resetPassword(
  payload: ResetPasswordPayload,
): Promise<void> {
  try {
    await $axios.post("reset-password", payload);
  } catch {
    await delay();
  }
}
