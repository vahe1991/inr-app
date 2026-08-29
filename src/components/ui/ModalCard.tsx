import type { ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";

type ModalCardProps = {
  visible: boolean;
  title: string;
  description?: string;
  subInfo?: string;
  icon?: ReactNode;
  onClose: () => void;
  children?: ReactNode;
};

/** Shared centered card used by the app dialogs (success, confirm, ...). */
export function ModalCard({
  visible,
  title,
  description,
  subInfo,
  icon,
  onClose,
  children,
}: ModalCardProps) {
  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        onPress={onClose}
        className="flex-1 items-center justify-center bg-black/40 px-5"
      >
        <Pressable
          className="w-full rounded-2xl bg-white p-5"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View className="gap-[4px]">
            <Text className="font-[600] mb-[4px] text-[16px] leading-7 text-grey-900">
              {title}
            </Text>
            <View className="flex-row items-center gap-[8px]">
              {icon}
              {description ? (
                <Text className=" text-[14px] leading-5 text-grey-900">
                  {description}
                </Text>
              ) : null}
            </View>
            {subInfo ? (
              <Text className="text-[12px] pl-[28px] leading-5 text-grey-500">
                {subInfo}
              </Text>
            ) : null}
          </View>

          <View className="mt-4 h-px bg-brand-600" />

          {children ? <View className="mt-4">{children}</View> : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
