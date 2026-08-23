import { ConfirmIcon } from "@/components/svg-components/confirm-icon";
import { HY } from "@/constants/hy";
import { INRAppRoutes } from "@/constants/routes.constants";
import { formatChatTime, resolveChatMediaUrl } from "@/helpers/chatUi";
import { useGetChatNotifications } from "@/hooks/chat/useGetChatNotifications.hook";
import { useGetChatUnreadCount } from "@/hooks/chat/useGetChatUnreadCount.hook";
import { useReadChat } from "@/hooks/chat/useReadChat.hook";
import type { ChatInboxItemType } from "@/types/chat-type";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import {
  ActivityIndicator,
  FlatList,
  Image,
  Pressable,
  Text,
  View,
} from "react-native";

export function ChatInboxPanel() {
  const router = useRouter();
  const {
    items,
    totalCount,
    isLoadingInbox,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isError,
  } = useGetChatNotifications();
  const { unreadCount, refetch: refetchUnread } = useGetChatUnreadCount();
  const readChat = useReadChat();

  useFocusEffect(
    useCallback(() => {
      void refetch();
      void refetchUnread();
    }, [refetch, refetchUnread]),
  );

  const onPressItem = (item: ChatInboxItemType) => {
    if (item.unreadCount > 0 || !item.isRead) {
      readChat.mutate(item.patientId);
    }
    router.push(
      INRAppRoutes.patientChat(item.patientId, item.patientName) as never,
    );
  };

  const loadMore = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  };

  const count = unreadCount || totalCount;

  return (
    <View className="flex-1">
      <Text className="px-4 pt-3 font-semibold text-[16px] text-brand-900">
        {HY.messages} {count}
      </Text>
      <View className="mx-4 mt-2 mb-3 h-px bg-brand-200" />

      {isLoadingInbox ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#5d4081" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-sm text-calendar-danger">
            {HY.chatLoadFailed}
          </Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <InboxRow item={item} onPress={() => onPressItem(item)} />
          )}
          ListEmptyComponent={
            <Text className="mt-8 text-center text-sm text-calendar-text-secondary">
              {HY.noMessages}
            </Text>
          }
          ListFooterComponent={
            <View className="items-center px-6 pb-8">
              {isFetchingNextPage ? (
                <ActivityIndicator color="#5d4081" className="mb-4" />
              ) : null}
              <Image
                source={require("../../../assets/images/chat-background-img.png")}
                className="mt-4 h-[260px] w-full"
                resizeMode="contain"
              />
            </View>
          }
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

function InboxRow({
  item,
  onPress,
}: {
  item: ChatInboxItemType;
  onPress: () => void;
}) {
  const photo = resolveChatMediaUrl(item.photo);
  const unread = item.unreadCount > 0 || !item.isRead;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3 active:bg-brand-50"
    >
      <View className="h-12 w-12 overflow-hidden rounded-full bg-brand-200">
        {photo ? (
          <Image source={{ uri: photo }} className="h-full w-full" />
        ) : (
          <View className="h-full w-full bg-brand-900" />
        )}
      </View>
      <View className="min-w-0 flex-1">
        <View className="flex-row items-center justify-between gap-2">
          <Text
            className="min-w-0 flex-1 font-semibold text-[14px] text-brand-900"
            numberOfLines={1}
          >
            {item.patientName || HY.patient}
          </Text>
          <Text className="text-[12px] text-grey-700">
            {formatChatTime(item.timestamp)}
          </Text>
        </View>
        <View className="mt-1 flex-row items-center gap-1">
          <ConfirmIcon size={16} color={unread ? "#8b6fb3" : "#6A4A98"} />
          <Text
            className={`min-w-0 flex-1 text-[12px] ${
              unread ? "font-semibold text-grey-900" : "text-grey-700"
            }`}
            numberOfLines={1}
          >
            {item.lastMessage || "—"}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}
