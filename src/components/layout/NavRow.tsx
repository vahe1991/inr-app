import { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

export function NavRow({
  label,
  icon,
  onPress,
}: {
  label: string;
  icon: ReactNode;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      className=" flex-row items-center gap-3 rounded-[14px] bg-brand-50 px-[20px] py-[13px] active:opacity-80"
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

      <Text className="font-[600] text-[14px] text-grey-900">{label}</Text>
    </Pressable>
  );
}
