import { CalendarIcon } from "@/components/svg-components/calendar-icon";
import { DatePickerModal } from "@/components/ui/DatePickerModal";
import { TextField } from "@/components/ui/TextField";
import dayjs from "dayjs";
import { useState } from "react";
import { Pressable, View } from "react-native";

type DateFieldProps = {
  label?: string;
  labelTone?: "primary" | "secondary";
  value?: Date | null;
  onChange: (date: Date) => void;
  onBlur?: () => void;
  error?: string;
  placeholder?: string;
  displayFormat?: string;
  minimumDate?: Date;
  maximumDate?: Date;
  disabled?: boolean;
  containerClassName?: string;
};

export function DateField({
  label,
  labelTone,
  value,
  onChange,
  onBlur,
  error,
  placeholder = "",
  displayFormat = "DD.MM.YY",
  minimumDate,
  maximumDate,
  disabled = false,
  containerClassName,
}: DateFieldProps) {
  const [open, setOpen] = useState(false);

  const display =
    value && dayjs(value).isValid() ? dayjs(value).format(displayFormat) : "";

  const close = () => {
    setOpen(false);
    onBlur?.();
  };

  return (
    <>
      <Pressable
        disabled={disabled}
        onPress={() => setOpen(true)}
        accessibilityRole="button"
        accessibilityLabel={label}
        accessibilityState={{ disabled }}
      >
        <View pointerEvents="none">
          <TextField
            label={label}
            labelTone={labelTone}
            value={display}
            placeholder={placeholder}
            editable={false}
            error={error}
            containerClassName={containerClassName}
            rightAccessory={<CalendarIcon />}
          />
        </View>
      </Pressable>

      <DatePickerModal
        visible={open}
        value={value ?? null}
        minimumDate={minimumDate}
        maximumDate={maximumDate}
        onClose={close}
        onConfirm={(date) => {
          onChange(date);
          close();
        }}
      />
    </>
  );
}
