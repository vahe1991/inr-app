import { ActivityIndicator, Pressable, Text } from "react-native";

type ButtonProps = {
  title: string;
  onPress?: () => void;
  loading?: boolean;
  disabled?: boolean;
  variant?: "primary" | "outline" | "ghost";
  className?: string;
};

export function Button({
  title,
  onPress,
  loading,
  disabled,
  variant = "primary",
  className = "",
}: ButtonProps) {
  const base =
    "h-12 w-full items-center justify-center rounded-lg px-4 active:opacity-80";
  const variants = {
    primary: "bg-calendar-primary",
    outline: "border border-calendar-primary bg-white",
    ghost: "bg-transparent",
  };
  const textVariants = {
    primary: "font-semibold text-white",
    outline: "font-semibold text-calendar-primary",
    ghost: "font-medium text-auth-link",
  };

  const isDisabled = Boolean(disabled || loading);
  const disabledPrimary =
    variant === "primary" && isDisabled && !loading
      ? "bg-grey-10"
      : variants[variant];
  const disabledText =
    variant === "primary" && isDisabled && !loading
      ? "font-normal text-[14px] text-grey-300"
      : textVariants[variant];

  return (
    <Pressable
      onPress={onPress}
      disabled={isDisabled}
      className={`${base} ${disabledPrimary} ${isDisabled ? "opacity-100" : ""} ${loading ? "opacity-60" : ""} ${className}`}
    >
      {loading ? (
        <ActivityIndicator color={variant === "primary" ? "#fff" : "#5d4081"} />
      ) : (
        <Text className={`text-base ${disabledText}`}>{title}</Text>
      )}
    </Pressable>
  );
}
