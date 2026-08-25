import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline" | "ghost" | "destructive";
  /** Pass a render function to paint the icon with the current content color. */
  icon?: ReactNode | ((color: string) => ReactNode);
  className?: string;
};

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  icon,
  className = "",
}: ButtonProps) {
  const base =
    "h-12 w-full items-center justify-center rounded-lg px-4 active:opacity-80";
  const variants = {
    primary: "bg-calendar-primary",
    outline: "border border-brand-200 bg-brand-10",
    ghost: "bg-transparent",
    destructive: "bg-red-700",
  };
  const textVariants = {
    primary: "font-semibold text-white",
    outline: "font-semibold text-calendar-primary",
    ghost: "font-[700] text-auth-link",
    destructive: "font-semibold text-white",
  };

  const contentColors = {
    primary: "#ffffff",
    outline: "#5d4081",
    ghost: "#6b5f82",
    destructive: "#ffffff",
  };

  const isDisabled = Boolean(disabled || loading);
  const isDimmed = isDisabled && !loading && variant === "primary";
  const disabledPrimary = isDimmed ? "bg-grey-10" : variants[variant];
  const disabledText = isDimmed
    ? "font-normal text-[14px] text-grey-300"
    : textVariants[variant];
  const contentColor = isDimmed ? "#bfbfbf" : contentColors[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`${base} ${disabledPrimary} ${isDisabled ? "opacity-100" : ""} ${loading ? "opacity-60" : ""} ${className}`}
    >
      {loading ? (
        <ActivityIndicator
          color={
            variant === "primary" || variant === "destructive"
              ? "#fff"
              : "#5d4081"
          }
        />
      ) : (
        <View className="flex-row items-center gap-2">
          {typeof icon === "function" ? icon(contentColor) : icon}
          <Text className={`text-base ${disabledText}`}>{title}</Text>
        </View>
      )}
    </Pressable>
  );
}
