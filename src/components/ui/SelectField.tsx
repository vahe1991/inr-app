import { HY } from "@/constants/hy";
import { SymbolView } from "expo-symbols";
import { useRef, useState } from "react";
import {
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
  useWindowDimensions,
  type View as ViewType,
} from "react-native";

export type SelectOption = {
  label: string;
  value: string | number;
};

type SelectFieldProps = {
  label?: string;
  labelTone?: "primary" | "secondary";
  placeholder?: string;
  options: SelectOption[];
  value?: string | number | null;
  onChange: (value: string | number) => void;
  onBlur?: () => void;
  disabled?: boolean;
  error?: string;
  containerClassName?: string;
};

export function SelectField({
  label,
  labelTone = "primary",
  placeholder,
  options,
  value,
  onChange,
  onBlur,
  disabled = false,
  error,
  containerClassName = "",
}: SelectFieldProps) {
  const triggerRef = useRef<ViewType>(null);
  const { height: windowHeight } = useWindowDimensions();
  const [open, setOpen] = useState(false);
  const [anchor, setAnchor] = useState({ x: 0, y: 0, width: 0, height: 0 });
  const selected = options.find((option) => option.value === value);

  const close = () => {
    setOpen(false);
    onBlur?.();
  };

  const openDropdown = () => {
    if (disabled) return;

    triggerRef.current?.measureInWindow((x, y, width, height) => {
      setAnchor({ x, y, width, height });
      setOpen(true);
    });
  };

  const top = anchor.y + anchor.height + 4;
  const maxHeight = Math.max(windowHeight - top - 16, 120);

  return (
    <View className={`mb-3 ${containerClassName}`}>
      {label ? (
        <Text
          className={`mb-1 px-2 font-medium text-[14px] leading-5 ${
            labelTone === "secondary" ? "text-grey-500" : "text-brand-700"
          }`}
        >
          {label}
        </Text>
      ) : null}

      <Pressable
        ref={triggerRef}
        collapsable={false}
        onPress={openDropdown}
        accessibilityRole="button"
        accessibilityState={{ disabled, expanded: open }}
        className={`min-h-12 flex-row items-center rounded-lg px-4 py-3 ${
          disabled ? "bg-brand-10" : "bg-white"
        } ${error ? "border border-calendar-danger" : "border border-brand-700"}`}
      >
        <Text
          className={`flex-1 text-[16px] leading-6 ${
            selected ? "text-grey-900" : "text-[#BFBFBF]"
          }`}
          numberOfLines={1}
        >
          {selected?.label ?? placeholder ?? HY.select}
        </Text>
        <SymbolView
          name={{
            ios: open ? "chevron.up" : "chevron.down",
            android: open ? "keyboard_arrow_up" : "keyboard_arrow_down",
            web: open ? "keyboard_arrow_up" : "keyboard_arrow_down",
          }}
          size={16}
          tintColor={disabled ? "#BFBFBF" : "#6A4A98"}
        />
      </Pressable>

      {error ? (
        <Text className="mt-1 font-medium text-xs text-calendar-danger">
          {error}
        </Text>
      ) : null}

      <Modal
        visible={open}
        transparent
        animationType="none"
        statusBarTranslucent
        onRequestClose={close}
      >
        <Pressable onPress={close} className="flex-1">
          <Pressable
            onPress={() => {}}
            style={{
              position: "absolute",
              top,
              left: anchor.x,
              width: anchor.width,
              maxHeight,
            }}
            className="overflow-hidden rounded-lg border border-brand-700 bg-white"
          >
            <ScrollView keyboardShouldPersistTaps="handled" bounces={false}>
              {options.map((item, index) => {
                const isSelected = item.value === value;

                return (
                  <View key={String(item.value)}>
                    {index > 0 ? <View className="h-px bg-brand-10" /> : null}
                    <Pressable
                      onPress={() => {
                        onChange(item.value);
                        close();
                      }}
                      className="flex-row items-center gap-3 px-4 py-3 active:bg-brand-10"
                    >
                      <Text
                        className={`flex-1 text-[15px] ${
                          isSelected
                            ? "font-semibold text-brand-700"
                            : "text-grey-900"
                        }`}
                      >
                        {item.label}
                      </Text>
                      {isSelected ? (
                        <SymbolView
                          name={{
                            ios: "checkmark",
                            android: "check",
                            web: "check",
                          }}
                          size={16}
                          tintColor="#6A4A98"
                        />
                      ) : null}
                    </Pressable>
                  </View>
                );
              })}
            </ScrollView>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
