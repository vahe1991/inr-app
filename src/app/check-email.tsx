import { AuthCard } from "@/components/layout/AuthCard";
import { Button } from "@/components/ui/Button";
import { AUTH_COPY } from "@/constants/authCopy";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Text, View } from "react-native";

export default function CheckEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <AuthCard title={AUTH_COPY.checkEmail.title}>
      <Text className="mb-2 font-medium text-sm leading-5 text-oxford-blue-200">
        {AUTH_COPY.checkEmail.description}
      </Text>
      {email ? (
        <Text className="mb-8 font-semibold text-sm text-grey-900">{email}</Text>
      ) : (
        <View className="mb-8" />
      )}
      <Button
        title={AUTH_COPY.checkEmail.backToLogin}
        variant="outline"
        onPress={() => router.replace("/sign-in")}
      />
    </AuthCard>
  );
}
