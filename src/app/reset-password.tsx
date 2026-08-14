import { AuthCard } from "@/components/layout/AuthCard";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { AUTH_COPY } from "@/constants/authCopy";
import { resetPassword } from "@/services/auth-password";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { View } from "react-native";

export default function ResetPasswordScreen() {
  const router = useRouter();
  const { token } = useLocalSearchParams<{ token?: string }>();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (password.length < 8) {
      setError(AUTH_COPY.resetPassword.minLength);
      return;
    }
    if (password !== confirm) {
      setError(AUTH_COPY.resetPassword.mismatch);
      return;
    }

    setLoading(true);
    setError("");
    try {
      await resetPassword({
        token: token ?? "",
        password,
        password_confirmation: confirm,
      });
      router.replace("/password-reset-success");
    } catch {
      setError(AUTH_COPY.login.genericError);
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthCard
      title={AUTH_COPY.resetPassword.title}
      subtitle={AUTH_COPY.resetPassword.subtitle}
    >
      <TextField
        label={AUTH_COPY.resetPassword.passwordLabel}
        placeholder={AUTH_COPY.resetPassword.passwordPlaceholder}
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TextField
        label={AUTH_COPY.resetPassword.confirmLabel}
        placeholder={AUTH_COPY.resetPassword.confirmPlaceholder}
        secureTextEntry
        value={confirm}
        onChangeText={setConfirm}
        error={error}
      />
      <View className="mt-4">
        <Button
          title={AUTH_COPY.resetPassword.submit}
          onPress={handleSubmit}
          loading={loading}
        />
      </View>
    </AuthCard>
  );
}
