import MenueIcon from "@/components/svg-components/menue-icon";
import MsgIcon from "@/components/svg-components/msg-icon";
import NotificationIcon from "@/components/svg-components/notification-icon";
import { HY } from "@/constants/hy";
import { INRAppRoutes } from "@/constants/routes.constants";
import { useGetChatUnreadCount } from "@/hooks/chat/useGetChatUnreadCount.hook";
import { useGetUnreadCount } from "@/hooks/notification/useGetUnreadCount.hook";
import { useFocusEffect, useNavigation, usePathname, useRouter } from "expo-router";
import { useCallback, type ReactNode } from "react";
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
  const router = useRouter();
  const pathname = usePathname();
  const { unreadCount, refetch } = useGetUnreadCount();
  const { unreadCount: chatUnread, refetch: refetchChatUnread } =
    useGetChatUnreadCount();
  const onNotifications = pathname.includes("/notifications");
  const onMessages = pathname.includes("/messages");

  useFocusEffect(
    useCallback(() => {
      void refetch();
      void refetchChatUnread();
    }, [refetch, refetchChatUnread]),
  );

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
      <View className="flex-row items-center gap-[1px]">
        {right}
        <Pressable
          onPress={() => {
            if (onNotifications) return;
            router.push(INRAppRoutes.notifications());
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={HY.notifications}
          className="items-center justify-center"
        >
          <NotificationIcon isUnreadNotifications={unreadCount > 0} />
        </Pressable>
        <Pressable
          onPress={() => {
            if (onMessages) return;
            router.push(INRAppRoutes.messages());
          }}
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={HY.messages}
          className="items-center justify-center"
        >
          <MsgIcon isHaveMsg={chatUnread > 0} />
        </Pressable>
        {showMenu ? (
          <Pressable
            onPress={() => openNearestDrawer(navigation)}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Menu"
            className="h-[38px] w-[38px] items-center justify-center rounded-[4px] active:bg-white/30"
          >
            <MenueIcon />
          </Pressable>
        ) : null}
      </View>
    </View>
  );
}
