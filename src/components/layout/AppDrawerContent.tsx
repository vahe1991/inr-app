import { LegalFooter } from "@/components/layout/LegalFooter";
import { HY } from "@/constants/hy";
import { useAuth } from "@/contexts/AuthContext";
import {
  DrawerContentScrollView,
  DrawerItemList,
  type DrawerContentComponentProps,
} from "expo-router/drawer";
import { Text, View } from "react-native";

export function AppDrawerContent(props: DrawerContentComponentProps) {
  const { name, email } = useAuth();

  return (
    <DrawerContentScrollView
      {...props}
      contentContainerStyle={{ flex: 1 }}
      className="bg-white"
    >
      <View className="mb-3 border-b border-brand-50 bg-brand-200 px-4 pb-4 pt-2">
        <Text className="font-bold text-xl text-brand-700">{HY.brand}</Text>
        {name || email ? (
          <View className="mt-2">
            {name ? (
              <Text
                className="font-semibold text-sm text-grey-900"
                numberOfLines={1}
              >
                {name}
              </Text>
            ) : null}
            {email ? (
              <Text
                className="mt-0.5 font-medium text-xs text-oxford-blue-200"
                numberOfLines={1}
              >
                {email}
              </Text>
            ) : null}
          </View>
        ) : null}
      </View>

      <DrawerItemList {...props} />
      <LegalFooter className="mt-auto items-start gap-3 px-4 py-4" />
    </DrawerContentScrollView>
  );
}
