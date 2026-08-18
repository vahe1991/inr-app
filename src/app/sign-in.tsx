import { AuthCard } from "@/components/layout/AuthCard";
import { SuccessIcon } from "@/components/svg-components/success-icon";
import { Button } from "@/components/ui/Button";
import { FormTextField } from "@/components/ui/FormTextField";
import { AUTH_COPY } from "@/constants/authCopy";
import { useAuth } from "@/contexts/AuthContext";
import { storage } from "@/libs/storage";
import type { AxiosError } from "axios";
import { Link } from "expo-router";
import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type SignInForm = {
  email: string;
  password: string;
  remember: boolean;
};

export default function SignInScreen() {
  const { logIn } = useAuth();
  const {
    control,
    handleSubmit,
    setError,
    clearErrors,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SignInForm>({
    defaultValues: { email: "", password: "", remember: false },
  });

  useEffect(() => {
    void (async () => {
      const remembered = await storage.getRememberCredentials();
      if (remembered) {
        reset({
          email: remembered.email,
          password: remembered.password,
          remember: true,
        });
      }
    })();
  }, [reset]);

  const onSubmit = async ({ email, password, remember }: SignInForm) => {
    clearErrors("root");
    try {
      if (remember) {
        await storage.setRememberCredentials({
          email: email.trim(),
          password,
        });
      } else {
        await storage.setRememberCredentials(null);
      }

      await logIn({ email: email.trim(), password });
    } catch (error) {
      const axiosError = error as AxiosError<{
        message?: string;
        errors?: Record<string, string[]>;
      }>;
      const apiErrors = axiosError.response?.data?.errors;
      const status = axiosError.response?.status;

      if (
        apiErrors?.email ||
        apiErrors?.password ||
        status === 401 ||
        status === 422
      ) {
        setError("email", { message: AUTH_COPY.login.emailError });
        setError("password", { message: AUTH_COPY.login.passwordError });
      } else {
        setError("root", { message: AUTH_COPY.login.genericError });
      }
    }
  };

  return (
    <AuthCard title={AUTH_COPY.login.title} subtitle={AUTH_COPY.login.subtitle}>
      <FormTextField
        control={control}
        name="email"
        rules={{
          required: AUTH_COPY.login.requiredEmail,
          pattern: {
            value: EMAIL_PATTERN,
            message: AUTH_COPY.login.invalidEmail,
          },
        }}
        label={AUTH_COPY.login.emailLabel}
        placeholder={AUTH_COPY.login.emailPlaceholder}
        autoCapitalize="none"
        keyboardType="email-address"
      />
      <FormTextField
        control={control}
        name="password"
        rules={{ required: AUTH_COPY.login.requiredPassword }}
        label={AUTH_COPY.login.passwordLabel}
        placeholder={AUTH_COPY.login.passwordPlaceholder}
        secureTextEntry
      />

      <View className="mb-8 mt-1 gap-3">
        <Controller
          control={control}
          name="remember"
          render={({ field: { value, onChange } }) => (
            <Pressable
              onPress={() => onChange(!value)}
              hitSlop={8}
              accessibilityRole="checkbox"
              accessibilityState={{ checked: Boolean(value) }}
              className="flex-row items-center gap-2 py-1"
            >
              <View
                className={`h-6 w-6 items-center justify-center rounded border ${
                  value
                    ? "border-calendar-primary bg-calendar-primary"
                    : "border-calendar-border bg-white"
                }`}
              >
                {value ? (
                  <SuccessIcon color="white" width={14} height={10} />
                ) : null}
              </View>
              <Text className="font-medium text-[12px] text-grey-500">
                {AUTH_COPY.login.rememberMe}
              </Text>
            </Pressable>
          )}
        />

        <View className="items-end">
          <Link href="/forgot-password" asChild>
            <Pressable>
              <Text className="font-medium text-sm text-gray-900">
                {AUTH_COPY.login.forgotPassword}
              </Text>
            </Pressable>
          </Link>
        </View>
      </View>

      {errors.root?.message ? (
        <Text className="mb-3 text-center font-medium text-sm text-calendar-danger">
          {errors.root.message}
        </Text>
      ) : null}

      <Button
        title={AUTH_COPY.login.submit}
        onPress={handleSubmit(onSubmit)}
        loading={isSubmitting}
      />
    </AuthCard>
  );
}
