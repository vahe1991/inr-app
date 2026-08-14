import { AuthCard } from "@/components/layout/AuthCard";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { AUTH_COPY } from "@/constants/authCopy";
import { requestPasswordReset } from "@/services/auth-password";
import { Link, useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function ForgotPasswordScreen() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!email.trim()) {
      setError(AUTH_COPY.login.requiredEmail);
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setError(AUTH_COPY.login.invalidEmail);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await requestPasswordReset({ email: email.trim() });
      router.push({
        pathname: "/check-email",
        params: { email: email.trim() },
      });
    } catch {
      setError(AUTH_COPY.login.genericError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={AUTH_COPY.forgotPassword.title}
      subtitle={AUTH_COPY.forgotPassword.subtitle}
    >
      <TextField
        label={AUTH_COPY.forgotPassword.emailLabel}
        placeholder={AUTH_COPY.forgotPassword.emailPlaceholder}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={error}
      />

      <View className="mt-4 gap-4">
        <Button
          title={AUTH_COPY.forgotPassword.submit}
          onPress={handleSubmit}
          loading={loading}
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
