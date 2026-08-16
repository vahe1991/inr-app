import { HY } from "@/constants/hy";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { FlatList, Modal, Pressable, Text, View } from "react-native";

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
  const [open, setOpen] = useState(false);
  const selected = options.find((option) => option.value === value);

  const close = () => {
    setOpen(false);
    onBlur?.();
  };

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
        onPress={() => !disabled && setOpen(true)}
        accessibilityRole="button"
        accessibilityState={{ disabled }}
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
            ios: "chevron.down",
            android: "keyboard_arrow_down",
            web: "keyboard_arrow_down",
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
        animationType="fade"
        statusBarTranslucent
        onRequestClose={close}
      >
        <Pressable
          onPress={close}
          className="flex-1 justify-end bg-black/40 px-4 pb-8"
        >
          <Pressable className="max-h-[60%] overflow-hidden rounded-3xl bg-white">
            <View className="border-b border-brand-100 px-5 py-4">
              <Text className="font-semibold text-[16px] text-grey-900">
                {label ?? placeholder ?? HY.select}
              </Text>
            </View>
            <FlatList
              data={options}
              keyExtractor={(item) => String(item.value)}
              renderItem={({ item }) => {
                const isSelected = item.value === value;
                return (
                  <Pressable
                    onPress={() => {
                      onChange(item.value);
                      close();
                    }}
                    className="flex-row items-center gap-3 px-5 py-3.5 active:bg-brand-10"
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
                );
              }}
              ItemSeparatorComponent={() => (
                <View className="h-px bg-brand-10" />
              )}
              keyboardShouldPersistTaps="handled"
            />
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}
