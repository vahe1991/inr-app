import { WarningFillIcon } from "@/components/svg-components/warning-fill-icon";
import { Button } from "@/components/ui/Button";
import { ModalCard } from "@/components/ui/ModalCard";
import { HY } from "@/constants/hy";
import type { ReactNode } from "react";
import { View } from "react-native";

type ConfirmModalProps = {
  visible: boolean;
  title: string;
  description?: string;
  icon?: ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  destructive?: boolean;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  description,
  icon = <WarningFillIcon />,
  confirmLabel = HY.confirm,
  cancelLabel = HY.cancel,
  destructive,
  loading,
  onConfirm,
  onCancel,
}: ConfirmModalProps) {
  return (
    <ModalCard
      visible={visible}
      title={title}
      description={description}
      icon={icon}
      onClose={onCancel}
    >
      <View className="flex-row gap-3">
        <View className="flex-1">
          <Button title={cancelLabel} variant="outline" onPress={onCancel} />
        </View>
        <View className="flex-1">
          <Button
            title={confirmLabel}
            variant={destructive ? "destructive" : "primary"}
            loading={loading}
            onPress={onConfirm}
          />
        </View>
      </View>
    </ModalCard>
  );
}
