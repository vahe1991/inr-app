import type { ReactNode } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthCardProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top"]}>
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerClassName="flex-grow px-[15px] py-[40px]"
          keyboardShouldPersistTaps="handled"
        >
          <View className="mb-10 items-center">
            <Image
              source={require("../../../assets/images/splash-icon.png")}
              className="h-[176px] w-[230px]"
              resizeMode="contain"
              accessibilityLabel="Նորք-Մարաշ բժշկական կենտրոն"
            />
          </View>

          {title || subtitle ? (
            <View className="mb-10 flex flex-col items-center gap-1">
              {title ? (
                <Text className="font-[700] text-[16px] uppercase text-brand-900">
                  {title}
                </Text>
              ) : null}
              {subtitle ? (
                <Text className="font-[700] text-[16px] leading-6 text-grey-900">
                  {subtitle}
                </Text>
              ) : null}
            </View>
          ) : null}

          <View className="w-full">{children}</View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
