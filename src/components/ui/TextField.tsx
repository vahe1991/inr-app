import { SearchIcon } from "@/components/svg-components/search-icon";
import { SymbolView } from "expo-symbols";
import { forwardRef, useState, type ReactNode } from "react";
import {
  Pressable,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

type TextFieldProps = TextInputProps & {
  label?: string;
  labelTone?: "primary" | "secondary";
  error?: string;
  containerClassName?: string;
  showSearchIcon?: boolean;
  rightAccessory?: ReactNode;
};

export const TextField = forwardRef<TextInput, TextFieldProps>(
  function TextField(
    {
      label,
      labelTone = "primary",
      error,
      containerClassName = "",
      secureTextEntry,
      showSearchIcon = false,
      rightAccessory,
      editable = true,
      multiline,
      ...props
    },
    ref,
  ) {
    const [visible, setVisible] = useState(false);
    const isPassword = Boolean(secureTextEntry);

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

        <View
          className={`flex-row rounded-lg bg-white px-4 py-3 ${
            multiline ? "min-h-24 items-start" : "min-h-12 items-center"
          } ${
            error ? "border border-calendar-danger" : "border border-brand-700"
          }`}
        >
          {showSearchIcon ? (
            <View className="mr-2 items-center justify-center">
              <SearchIcon />
            </View>
          ) : null}

          <TextInput
            ref={ref}
            placeholderTextColor="#BFBFBF"
            editable={editable}
            multiline={multiline}
            textAlignVertical={multiline ? "top" : undefined}
            className={`flex-1 p-0 font-sans text-[16px] leading-6 text-grey-900 ${
              multiline ? "min-h-[48px]" : "min-h-[24px]"
            } ${isPassword ? "pr-1" : ""}`}
            secureTextEntry={isPassword && !visible}
            {...props}
          />

          {rightAccessory}

          {isPassword ? (
            <Pressable
              onPress={() => setVisible((v) => !v)}
              hitSlop={8}
              accessibilityRole="button"
              accessibilityLabel={
                visible ? "Թաքցնել գաղտնաբառը" : "Ցույց տալ գաղտնաբառը"
              }
              className="ml-2 items-center justify-center active:opacity-70"
            >
              <SymbolView
                name={{
                  ios: visible ? "eye.slash" : "eye",
                  android: visible ? "visibility_off" : "visibility",
                  web: visible ? "visibility_off" : "visibility",
                }}
                size={18}
                tintColor="#6A4A98"
              />
            </Pressable>
          ) : null}
        </View>

        {error ? (
          <Text className="mt-1 font-medium text-xs text-calendar-danger">
            {error}
          </Text>
        ) : null}
      </View>
    );
  },
);
