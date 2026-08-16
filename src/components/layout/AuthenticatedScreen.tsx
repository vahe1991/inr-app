import { AppHeader } from "@/components/layout/AppHeader";
import type { ReactNode } from "react";
import { View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type AuthenticatedScreenProps = {
  children: ReactNode;
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
  contentClassName?: string;
};

export function AuthenticatedScreen({
  children,
  title,
  left,
  right,
  contentClassName = "flex-1",
}: AuthenticatedScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <AppHeader title={title} left={left} right={right} showMenu />
      <View className={contentClassName}>{children}</View>
    </SafeAreaView>
  );
}
