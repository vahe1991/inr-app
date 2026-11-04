import type { ReactNode } from "react";
import { ActivityIndicator, Pressable, Text, View } from "react-native";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline" | "ghost" | "destructive" | "danger";
  /** Pass a render function to paint the icon with the current content color. */
  icon?: ReactNode | ((color: string) => ReactNode);
  className?: string;
  fullWidth?: boolean;
};

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  icon,
  className = "",
  fullWidth = true,
}: ButtonProps) {
  const base = `h-12 items-center justify-center rounded-lg px-4 active:opacity-80 ${
    fullWidth ? "w-full" : "self-start"
  }`;
  const variants = {
    primary: "bg-brand-700",
    outline: "border border-brand-700 bg-[transparent]",
    ghost: "bg-transparent",
    destructive: "bg-red-700",
    danger: "border border-red-700 bg-[transparent]",
  };
  const textVariants = {
    primary: "font-[700] text-white",
    outline: "font-[700] text-brand-700",
    ghost: "font-[700] text-auth-link",
    destructive: "font-[700] text-white",
    danger: "font-[700] text-red-700",
  };

  const contentColors = {
    primary: "#ffffff",
    outline: "#5d4081",
    ghost: "#6b5f82",
    destructive: "#ffffff",
    danger: "#FF4D4F",
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
      className={`relative ${base} ${disabledPrimary} ${isDisabled ? "opacity-100" : ""} ${loading ? "opacity-60" : ""} ${className}`}
    >
      <View
        className="flex-row items-center gap-2"
        style={{ opacity: loading ? 0 : 1 }}
      >
        {typeof icon === "function" ? icon(contentColor) : icon}
        <Text className={`text-base ${disabledText}`}>{title}</Text>
      </View>
      {loading ? (
        <View className="absolute inset-0 items-center justify-center">
          <ActivityIndicator
            color={
              variant === "primary" || variant === "destructive"
                ? "#fff"
                : variant === "danger"
                  ? "#FF4D4F"
                  : "#5d4081"
            }
          />
        </View>
      ) : null}
    </Pressable>
  );
}
