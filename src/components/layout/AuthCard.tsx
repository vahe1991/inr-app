import type { ReactNode } from "react";
import { useEffect, useState } from "react";
import {
  Image,
  Keyboard,
  Platform,
  ScrollView,
  Text,
  View,
  type KeyboardEvent,
} from "react-native";
import { SafeAreaView, useSafeAreaInsets } from "react-native-safe-area-context";

type AuthCardProps = {
  children: ReactNode;
  title?: string;
  subtitle?: string;
};

export function AuthCard({ children, title, subtitle }: AuthCardProps) {
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (event: KeyboardEvent) => {
      setKeyboardHeight(Math.max(event.endCoordinates.height - insets.bottom, 0));
    };

    const onHide = () => setKeyboardHeight(0);

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [insets.bottom]);

  return (
    <SafeAreaView className="flex-1 bg-white" edges={["top", "bottom"]}>
      <ScrollView
        className="flex-1"
        contentContainerClassName="grow px-[15px] pt-[40px]"
        contentContainerStyle={{ paddingBottom: 32 + keyboardHeight }}
        keyboardShouldPersistTaps="always"
        showsVerticalScrollIndicator={false}
      >
        <View className="mb-10 items-center">
          <Image
            source={require("../../../assets/images/ios-light.png")}
            className="h-[176px] w-[230px]"
            resizeMode="contain"
            accessibilityLabel="Նորք-Մարաշ բժշկական կենտրոն"
          />
        </View>

        {title || subtitle ? (
          <View className="mb-10 flex flex-col items-center gap-1">
            {title ? (
              <Text className="font-[700] text-[16px] uppercase text-brand-900">
                {title}
              </Text>
            ) : null}
            {subtitle ? (
              <Text className="font-[700] text-[16px] leading-6 text-grey-900">
                {subtitle}
              </Text>
            ) : null}
          </View>
        ) : null}

        <View className="w-full">{children}</View>
      </ScrollView>
    </SafeAreaView>
  );
}
