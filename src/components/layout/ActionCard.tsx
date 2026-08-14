import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

export function ActionCard({
  label,
  icon,
  className = "",
  onPress,
}: {
  label: string;
  className?: string;
  icon: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className={`h-[120px] w-[130px] flex-1 items-center bg-brand-50 gap-2 pt-[24px] pb-2 active:opacity-80 ${className}`}
    >
      <View
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.22,
          shadowRadius: 2.22,

          elevation: 3,
        }}
        className="w-[38px] h-[38px] items-center justify-center rounded-[10px] border border-brand-700 bg-brand-50 shadow-[0px_4px_5px_0px_#00000029]"
      >
        {icon}
      </View>
      <Text className="text-center font-[600] text-[13px] text-grey-900">
        {label}
      </Text>
    </Pressable>
  );
}
