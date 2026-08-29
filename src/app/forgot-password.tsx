import { AuthCard } from "@/components/layout/AuthCard";
import { Button } from "@/components/ui/Button";
import { FormTextField } from "@/components/ui/FormTextField";
import { AUTH_COPY } from "@/constants/authCopy";
import { useForgotPasswordReset } from "@/hooks/auth-user/useForgotPasswordReset.hook";
import { Link, useRouter } from "expo-router";
import { useForm } from "react-hook-form";
import { Pressable, Text, View } from "react-native";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

type ForgotPasswordForm = {
  email: string;
};

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const { mutate: forgotPassword, isPending } = useForgotPasswordReset(
    (_data, variables) => {
      router.push({
        pathname: "/check-email",
        params: { email: variables.email },
      });
    },
    (e) => {
      setError("email", {
        message:
          e?.response?.data?.errors?.email?.[0] || AUTH_COPY.login.genericError,
      });
    },
  );
  const { control, handleSubmit, setError } = useForm<ForgotPasswordForm>({
    defaultValues: { email: "" },
  });

  const onSubmit = ({ email }: ForgotPasswordForm) => {
    forgotPassword({ email: email.trim() });
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
          loading={isPending}
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
