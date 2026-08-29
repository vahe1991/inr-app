import { resetPassword } from "@/services/auth-user";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

export type ResetPasswordError = AxiosError<{
  errors?: {
    email?: string[];
    code?: string[];
    password?: string[];
    password_confirmation?: string[];
  };
}>;

export const useResetPassword = (
  onSuccessCallback: (data: unknown) => void = () => {},
  onErrorCallback: (error: ResetPasswordError) => void = () => {},
) => {
  return useMutation({
    mutationFn: resetPassword,
    mutationKey: ["reset-password"],
    onSuccess: async (data) => {
      onSuccessCallback(data);
    },
    onError: (e: ResetPasswordError) => {
      onErrorCallback(e);
    },
  });
};
