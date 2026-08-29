import { TrashIcon } from "@/components/svg-components/trash-icon";
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
  subInfo?: string;
  loading?: boolean;
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmModal({
  visible,
  title,
  description,
  subInfo,
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
      subInfo={subInfo}
      icon={icon}
      onClose={onCancel}
    >
      <View className="flex-row justify-end gap-3">
        <Button
          title={cancelLabel}
          variant="outline"
          onPress={onCancel}
          fullWidth={false}
        />

        <Button
          title={confirmLabel}
          variant={
            HY.delete === confirmLabel || HY.remove === confirmLabel
              ? "danger"
              : destructive
                ? "destructive"
                : "primary"
          }
          loading={loading}
          onPress={onConfirm}
          fullWidth={false}
          icon={
            HY.delete === confirmLabel || HY.remove === confirmLabel ? (
              <TrashIcon />
            ) : undefined
          }
        />
      </View>
    </ModalCard>
  );
}
