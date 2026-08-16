import type { ReactNode } from "react";
import { Modal, Pressable, Text, View } from "react-native";

type ModalCardProps = {
  visible: boolean;
  title: string;
  description?: string;
  icon?: ReactNode;
  onClose: () => void;
  children?: ReactNode;
};

/** Shared centered card used by the app dialogs (success, confirm, ...). */
export function ModalCard({
  visible,
  title,
  description,
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
          className="w-full rounded-2xl bg-brand-100 p-5"
          style={{
            shadowColor: "#000",
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.12,
            shadowRadius: 12,
            elevation: 6,
          }}
        >
          <View className="flex-row items-center gap-3">
            {icon}
            <View className="min-w-0 flex-1">
              <Text className="font-semibold text-[16px] leading-7 text-brand-700">
                {title}
              </Text>
              {description ? (
                <Text className="mt-0.5 text-[12px] leading-5 text-grey-700">
                  {description}
                </Text>
              ) : null}
            </View>
          </View>

          <View className="mt-4 h-px bg-brand-600" />

          {children ? <View className="mt-4">{children}</View> : null}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
