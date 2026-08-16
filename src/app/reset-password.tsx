import { AuthCard } from "@/components/layout/AuthCard";
import { Button } from "@/components/ui/Button";
import { FormTextField } from "@/components/ui/FormTextField";
import { AUTH_COPY } from "@/constants/authCopy";
import { resetPassword } from "@/services/auth-password";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { View } from "react-native";

type ResetPasswordForm = {
  password: string;
  confirm: string;
};

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const {
    control,
    handleSubmit,
    getValues,
    setError,
    formState: { isSubmitting },
  } = useForm<ResetPasswordForm>({
    defaultValues: { password: "", confirm: "" },
  });

  const onSubmit = async ({ password, confirm }: ResetPasswordForm) => {
    try {
      await resetPassword({
        token: token ?? "",
        password,
        password_confirmation: confirm,
      });
      router.replace("/password-reset-success");
    } catch {
      setError("confirm", { message: AUTH_COPY.login.genericError });
    }
  };

  return (
    <AuthCard
      title={AUTH_COPY.resetPassword.title}
      subtitle={AUTH_COPY.resetPassword.subtitle}
    >
      <FormTextField
        control={control}
        name="password"
        rules={{
          required: AUTH_COPY.login.requiredPassword,
          minLength: {
            value: 8,
            message: AUTH_COPY.resetPassword.minLength,
          },
        }}
        label={AUTH_COPY.resetPassword.passwordLabel}
        placeholder={AUTH_COPY.resetPassword.passwordPlaceholder}
        secureTextEntry
      />
      <FormTextField
        control={control}
        name="confirm"
        rules={{
          required: AUTH_COPY.login.requiredPassword,
          validate: (value) =>
            value === getValues("password") || AUTH_COPY.resetPassword.mismatch,
        }}
        label={AUTH_COPY.resetPassword.confirmLabel}
        placeholder={AUTH_COPY.resetPassword.confirmPlaceholder}
        secureTextEntry
      />
      <View className="mt-4">
        <Button
          title={AUTH_COPY.resetPassword.submit}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
        />
      </View>
    </AuthCard>
  );
}
