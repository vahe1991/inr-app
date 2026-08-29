import { AuthCard } from "@/components/layout/AuthCard";
import { Button } from "@/components/ui/Button";
import { FormTextField } from "@/components/ui/FormTextField";
import { AUTH_COPY } from "@/constants/authCopy";
import { useResetPassword } from "@/hooks/auth-user/useResetPassword.hook";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";

type ResetPasswordForm = {
  email: string;
  password: string;
  password_confirmation: string;
  code: string;
};

const API_TO_FORM_FIELD = {
  code: "code",
  password: "password",
  password_confirmation: "password_confirmation",
} as const;

export default function ResetPasswordScreen() {
  const router = useRouter();

  const { email } = useLocalSearchParams<{ email?: string }>();
  const { control, handleSubmit, getValues, setError } =
    useForm<ResetPasswordForm>({
      defaultValues: { password: "", password_confirmation: "", code: "" },
    });
  const { mutate: resetPassword, isPending } = useResetPassword(
    () => {
      router.replace("/password-reset-success");
    },
    (e) => {
      const errors = e.response?.data?.errors;
      let mapped = false;

      (
        Object.keys(API_TO_FORM_FIELD) as (keyof typeof API_TO_FORM_FIELD)[]
      ).forEach((field) => {
        const message = errors?.[field]?.[0];
        if (!message) return;
        mapped = true;
        setError(API_TO_FORM_FIELD[field], { message });
      });

      if (!mapped) {
        setError("password_confirmation", {
          message: AUTH_COPY.login.genericError,
        });
      }
    },
  );

  const onSubmit = async ({
    password,
    password_confirmation,
    code,
  }: ResetPasswordForm) => {
    resetPassword({
      email: email ?? "",
      code: code,
      password,
      password_confirmation,
    });
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
        name="password_confirmation"
        rules={{
          required: AUTH_COPY.login.requiredPassword,
          validate: (value) =>
            value === getValues("password") || AUTH_COPY.resetPassword.mismatch,
        }}
        label={AUTH_COPY.resetPassword.confirmLabel}
        placeholder={AUTH_COPY.resetPassword.confirmPlaceholder}
        secureTextEntry
      />
      <FormTextField
        control={control}
        name="code"
        rules={{
          required: AUTH_COPY.resetPassword.requiredToken,
        }}
        label={AUTH_COPY.resetPassword.tokenLabel}
        placeholder={AUTH_COPY.resetPassword.tokenPlaceholder}
      />
      <View className="mt-4">
        <Button
          title={AUTH_COPY.resetPassword.submit}
          onPress={handleSubmit(onSubmit)}
          loading={isPending}
        />
      </View>
      <View className="mt-4 items-end">
        <Link href="/sign-in" asChild>
          <Pressable>
            <Text className="font-medium text-sm text-gray-900">
              {AUTH_COPY.forgotPassword.backToLogin}
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthCard>
  );
}
