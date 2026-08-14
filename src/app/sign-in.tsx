import { AuthCard } from "@/components/layout/AuthCard";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { AUTH_COPY } from "@/constants/authCopy";
import { useAuth } from "@/contexts/AuthContext";
import { storage } from "@/libs/storage";
import type { AxiosError } from "axios";
import { Link } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function SignInScreen() {
  const { logIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{
    email?: string;
    password?: string;
    form?: string;
  }>({});

  useEffect(() => {
    void (async () => {
      const remembered = await storage.getRememberEmail();
      if (remembered) {
        setEmail(remembered);
        setRemember(true);
      }
    })();
  }, []);

  const handleLogin = async () => {
    const nextErrors: typeof errors = {};
    if (!email.trim()) nextErrors.email = AUTH_COPY.login.requiredEmail;
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      nextErrors.email = AUTH_COPY.login.invalidEmail;
    }
    if (!password) nextErrors.password = AUTH_COPY.login.requiredPassword;

    if (Object.keys(nextErrors).length) {
      setErrors(nextErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    try {
      await logIn({ email: email.trim(), password });
      await storage.setRememberEmail(remember ? email.trim() : null);
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
        setErrors({
          email: AUTH_COPY.login.emailError,
          password: AUTH_COPY.login.passwordError,
        });
      } else {
        setErrors({ form: AUTH_COPY.login.genericError });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard title={AUTH_COPY.login.title} subtitle={AUTH_COPY.login.subtitle}>
      <TextField
        label={AUTH_COPY.login.emailLabel}
        placeholder={AUTH_COPY.login.emailPlaceholder}
        autoCapitalize="none"
        keyboardType="email-address"
        value={email}
        onChangeText={setEmail}
        error={errors.email}
      />
      <TextField
        label={AUTH_COPY.login.passwordLabel}
        placeholder={AUTH_COPY.login.passwordPlaceholder}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        error={errors.password}
      />

      <View className="mb-8 mt-1 gap-3">
        <Pressable
          onPress={() => setRemember((v) => !v)}
          className="flex-row items-center gap-2"
        >
          <View
            className={`h-6 w-6 items-center justify-center rounded border ${
              remember
                ? "border-calendar-primary bg-calendar-primary"
                : "border-calendar-border bg-white"
            }`}
          >
            {remember ? <Text className="text-xs text-white">✓</Text> : null}
          </View>
          <Text className="font-medium text-[12px] text-grey-500">
            {AUTH_COPY.login.rememberMe}
          </Text>
        </Pressable>

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

      {errors.form ? (
        <Text className="mb-3 text-center font-medium text-sm text-calendar-danger">
          {errors.form}
        </Text>
      ) : null}

      <Button
        title={AUTH_COPY.login.submit}
        onPress={handleLogin}
        loading={loading}
      />
    </AuthCard>
  );
}
