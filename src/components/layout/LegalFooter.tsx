import { HY } from "@/constants/hy";
import { Linking, Pressable, Text, View } from "react-native";

const PRIVACY_POLICY_URL = process.env.EXPO_PUBLIC_PRIVACY_POLICY_URL;

type LegalFooterProps = {
  className?: string;
};

export function LegalFooter({ className }: LegalFooterProps) {
  return (
    <View className={className ?? "mt-auto w-full items-center gap-3"}>
      <Text className="text-center text-[12px] font-[600] text-grey-900">
        {HY.medicalDisclaimerTitle}
      </Text>
      <Text className="text-center text-[11px] leading-4 text-grey-500">
        {HY.medicalDisclaimer}
      </Text>
      <Pressable
        onPress={() => {
          if (PRIVACY_POLICY_URL) void Linking.openURL(PRIVACY_POLICY_URL);
        }}
        accessibilityRole="link"
        accessibilityLabel={HY.privacyPolicy}
      >
        <Text className="text-center text-[14px] font-[600] text-brand-700 underline">
          {HY.privacyPolicy}
        </Text>
      </Pressable>
    </View>
  );
}
