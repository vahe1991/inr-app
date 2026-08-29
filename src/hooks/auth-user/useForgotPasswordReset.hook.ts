import { forgotPassword, type ForgotPasswordPayload } from "@/services/auth-user";
import { useMutation } from "@tanstack/react-query";
import type { AxiosError } from "axios";

type ForgotPasswordError = AxiosError<{
  errors?: { email?: string[] };
}>;

export const useForgotPasswordReset = (
  onSuccessCallback: (
    data: unknown,
    variables: ForgotPasswordPayload,
  ) => void = () => {},
  onErrorCallback: (error: ForgotPasswordError) => void = () => {},
) => {
  return useMutation({
    mutationFn: forgotPassword,
    mutationKey: ["forgot-password"],
    onSuccess: async (data, variables) => {
      onSuccessCallback(data, variables);
    },
    onError: (e: ForgotPasswordError) => {
      onErrorCallback(e);
    },
  });
};
