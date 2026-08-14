import { HY } from "@/constants/hy";
import { SymbolView } from "expo-symbols";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type PatientSubHeaderProps = {
  title: string;
  onBack: () => void;
  right?: ReactNode;
};

export function PatientSubHeader({
  title,
  onBack,
  right,
}: PatientSubHeaderProps) {
  return (
    <View className="mb-4 flex-row items-center gap-2">
      <Pressable
        onPress={onBack}
        hitSlop={8}
        className="h-9 w-9 items-center justify-center"
        accessibilityRole="button"
        accessibilityLabel={HY.back}
      >
        <SymbolView
          name={{
            ios: "chevron.left",
            android: "arrow_back",
            web: "arrow_back",
          }}
          size={22}
          tintColor="#6A4A98"
        />
      </Pressable>
      <Text className="min-w-0 flex-1 font-bold text-lg text-grey-900">
        {title}
      </Text>
      {right}
    </View>
  );
}
