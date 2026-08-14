import { HY } from "@/constants/hy";
import { useNavigation } from "expo-router";
import { SymbolView } from "expo-symbols";
import type { ReactNode } from "react";
import { Pressable, Text, View } from "react-native";

type AppHeaderProps = {
  title?: string;
  left?: ReactNode;
  right?: ReactNode;
  showMenu?: boolean;
};

type NavNode = {
  openDrawer?: () => void;
  getParent?: () => NavNode | undefined;
};

function openNearestDrawer(navigation: NavNode) {
  let current: NavNode | undefined = navigation;
  while (current) {
    if (typeof current.openDrawer === "function") {
      current.openDrawer();
      return;
    }
    current = current.getParent?.();
  }
}

export function AppHeader({
  title = HY.brand,
  left,
  right,
  showMenu = true,
}: AppHeaderProps) {
  const navigation = useNavigation() as NavNode;

  return (
    <View className="flex-row items-center justify-between border-b border-brand-50 bg-brand-200 px-3 pb-3 pt-2">
      <View className="min-w-0 flex-1 flex-row items-center gap-2">
        {left}
        <Text
          className="flex-shrink font-bold text-xl text-brand-700"
          numberOfLines={1}
        >
          {title}
        </Text>
      </View>
      <View className="flex-row items-center gap-2">
        {right}
        {showMenu ? (
          <Pressable
            onPress={() => openNearestDrawer(navigation)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Menu"
            className="h-10 w-10 items-center justify-center rounded-full active:bg-white/50"
          >
            <SymbolView
              name={{
                ios: "line.3.horizontal",
                android: "menu",
                web: "menu",
              }}
              size={24}
              tintColor="#6A4A98"
            />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
