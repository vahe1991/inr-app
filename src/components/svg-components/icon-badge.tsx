import type { ReactNode } from "react";
import { View } from "react-native";

/** Rounded tinted square used behind screen-header icons. */
export function IconBadge({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <View
      className={`h-10 w-10 items-center justify-center rounded-lg  ${className || "bg-[#ede7f6]"}`}
      style={{
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.23,
        shadowRadius: 2.62,
        elevation: 4,
      }}
    >
      {children}
    </View>
  );
}
