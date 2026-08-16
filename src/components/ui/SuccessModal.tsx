import { HeartBtnIcon } from "@/components/svg-components/heart-btn-icon";
import { Button } from "@/components/ui/Button";
import { ModalCard } from "@/components/ui/ModalCard";
import { HY } from "@/constants/hy";
import { type ReactNode, useEffect, useRef } from "react";

type SuccessModalProps = {
  visible: boolean;
  title: string;
  description?: string;
  icon?: ReactNode;
  actionLabel?: string;
  /** Time before the modal closes itself. Pass 0 to keep it open. */
  autoCloseMs?: number;
  onClose: () => void;
};

export function SuccessModal({
  visible,
  title,
  description,
  icon = <HeartBtnIcon />,
  actionLabel = HY.ok,
  autoCloseMs = 5000,
  onClose,
}: SuccessModalProps) {
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  });

  useEffect(() => {
    if (!visible || !autoCloseMs) return;

    const timer = setTimeout(() => onCloseRef.current(), autoCloseMs);
    return () => clearTimeout(timer);
  }, [visible, autoCloseMs]);

  return (
    <ModalCard
      visible={visible}
      title={title}
      description={description}
      icon={icon}
      onClose={onClose}
    >
      <Button title={actionLabel} onPress={onClose} />
    </ModalCard>
  );
}
