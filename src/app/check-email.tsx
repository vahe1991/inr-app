import { AuthCard } from "@/components/layout/AuthCard";
import { Button } from "@/components/ui/Button";
import { AUTH_COPY } from "@/constants/authCopy";
import { Link, useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function CheckEmailScreen() {
  const router = useRouter();
  const { email } = useLocalSearchParams<{ email?: string }>();

  return (
    <AuthCard title={AUTH_COPY.checkEmail.title}>
      <Text className="mb-2 font-medium text-sm leading-5 text-oxford-blue-200">
        {AUTH_COPY.checkEmail.description}
      </Text>
      {email ? (
        <Text className="mb-8 font-semibold text-sm text-grey-900">
          {email}
        </Text>
      ) : (
        <View className="mb-8" />
      )}
      <View className="mt-4 gap-4">
        <Button
          title={AUTH_COPY.resetPassword.submit}
          onPress={() =>
            router.replace({
              pathname: "/reset-password",
              params: { email },
            })
          }
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
