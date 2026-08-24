import { PatientAvatar } from "@/components/patient/PatientAvatar";
import { ArrowLeftIcon } from "@/components/svg-components/arrow-left-icon";
import { ConfirmIcon } from "@/components/svg-components/confirm-icon";
import { IconBadge } from "@/components/svg-components/icon-badge";
import MsgIcon from "@/components/svg-components/msg-icon";
import { HY } from "@/constants/hy";
import { INRAppRoutes } from "@/constants/routes.constants";
import { formatChatTime } from "@/helpers/chatUi";
import { useGetChatNotifications } from "@/hooks/chat/useGetChatNotifications.hook";
import { useGetChatUnreadCount } from "@/hooks/chat/useGetChatUnreadCount.hook";
import { useReadAllChatNotifications } from "@/hooks/chat/useReadAllChatNotifications.hook";
import { useReadChat } from "@/hooks/chat/useReadChat.hook";
import type { ChatInboxItemType } from "@/types/chat-type";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback } from "react";
import { FlatList, ImageBackground, Pressable, Text, View } from "react-native";

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
  const readAll = useReadAllChatNotifications();

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
      <ImageBackground
        source={require("../../../assets/images/chat-background-img.png")}
        resizeMode="contain"
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          bottom: 20,
          height: 280,
          opacity: 0.5,
        }}
      />
      <View className="px-4 pt-1">
        <Pressable
          onPress={() => router.back()}
          hitSlop={8}
          className="mb-1 h-12 w-12 items-start justify-center"
          accessibilityRole="button"
          accessibilityLabel={HY.back}
        >
          <ArrowLeftIcon />
        </Pressable>
        <View className="flex-row items-center gap-2">
          <MsgIcon size={36} isHaveMsg={unreadCount > 0} />
          <Text className="font-semibold text-[16px] text-brand-900">
            {HY.messages} {count}
          </Text>

          <Pressable
            onPress={() => readAll.mutate()}
            disabled={readAll.isPending || unreadCount < 1}
            className="ml-[auto]"
          >
            <IconBadge>
              <ConfirmIcon />
            </IconBadge>
          </Pressable>
        </View>
      </View>
      <View className="mx-4 mt-2 mb-3 h-px bg-brand-200" />

      {isLoadingInbox ? (
        <PatientAvatar size={32} />
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
          className="bg-transparent"
          renderItem={({ item }) => (
            <InboxRow item={item} onPress={() => onPressItem(item)} />
          )}
          ListEmptyComponent={
            <Text className="mt-8 text-center text-sm text-calendar-text-secondary">
              {HY.noMessages}
            </Text>
          }
          ListFooterComponent={
            isFetchingNextPage ? <PatientAvatar size={32} /> : null
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
  const unread = item.unreadCount > 0 || !item.isRead;

  return (
    <Pressable
      onPress={onPress}
      className="flex-row items-center gap-3 px-4 py-3 active:bg-brand-50"
    >
      <PatientAvatar photo={item.photo} size={32} />
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
