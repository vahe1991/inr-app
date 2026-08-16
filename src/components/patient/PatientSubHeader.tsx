import { ArrowLeftIcon } from "@/components/svg-components/arrow-left-icon";
import { HY } from "@/constants/hy";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type PatientSubHeaderProps = {
  title: string;
  description?: string;
  icon?: ReactNode;
  onBack: () => void;
  right?: ReactNode;
};

export function PatientSubHeader({
  title,
  description,
  icon,
  onBack,
  right,
}: PatientSubHeaderProps) {
  return (
    <View>
      <Pressable
        onPress={onBack}
        hitSlop={8}
        className="mb-1 h-12 w-12 items-start justify-center"
        accessibilityRole="button"
        accessibilityLabel={HY.back}
      >
        <ArrowLeftIcon />
      </Pressable>

      <View className="mb-6 flex-row items-center gap-3 border-b border-brand-600 pb-3 pt-1">
        {icon}

        <View className="min-w-0 flex-1">
          <Text className="font-semibold text-[20px] leading-7 text-[#262626]">
            {title}
          </Text>
          {description ? (
            <Text className="mt-0.5 text-[12px] leading-5 text-grey-900">
              {description}
            </Text>
          ) : null}
        </View>

        {right}
      </View>
    </View>
  );
}
