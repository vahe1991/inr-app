import { AuthCard } from "@/components/layout/AuthCard";
import { Button } from "@/components/ui/Button";
import { AUTH_COPY } from "@/constants/authCopy";
import { useRouter } from "expo-router";
import { View } from "react-native";

export default function PasswordResetSuccessScreen() {
  const router = useRouter();

  return (
    <AuthCard title={AUTH_COPY.resetSuccess.title}>
      <View className="mt-4">
        <Button
          title={AUTH_COPY.resetSuccess.submit}
          onPress={() => router.replace("/sign-in")}
        />
      </View>
    </AuthCard>
  );
}
