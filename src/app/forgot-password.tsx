import { AuthCard } from "@/components/layout/AuthCard";
import { Button } from "@/components/ui/Button";
import { FormTextField } from "@/components/ui/FormTextField";
import { AUTH_COPY } from "@/constants/authCopy";
import { requestPasswordReset } from "@/services/auth-password";
import { Link, useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ForgotPasswordForm = {
  email: string;
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const {
    control,
    handleSubmit,
    setError,
    formState: { isSubmitting },
  } = useForm<ForgotPasswordForm>({ defaultValues: { email: "" } });

  const onSubmit = async ({ email }: ForgotPasswordForm) => {
    const trimmed = email.trim();
    try {
      await requestPasswordReset({ email: trimmed });
      router.push({
        pathname: "/check-email",
        params: { email: trimmed },
      });
    } catch {
      setError("email", { message: AUTH_COPY.login.genericError });
    }
  };

  return (
    <AuthCard
      title={AUTH_COPY.forgotPassword.title}
      subtitle={AUTH_COPY.forgotPassword.subtitle}
    >
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
        label={AUTH_COPY.forgotPassword.emailLabel}
        placeholder={AUTH_COPY.forgotPassword.emailPlaceholder}
        autoCapitalize="none"
        keyboardType="email-address"
      />

      <View className="mt-4 gap-4">
        <Button
          title={AUTH_COPY.forgotPassword.submit}
          onPress={handleSubmit(onSubmit)}
          loading={isSubmitting}
        />
        <Link href="/sign-in" asChild>
          <Pressable className="items-center py-2">
            <Text className="font-medium text-sm text-calendar-primary">
              {AUTH_COPY.forgotPassword.backToLogin}
            </Text>
          </Pressable>
        </Link>
      </View>
    </AuthCard>
  );
}
