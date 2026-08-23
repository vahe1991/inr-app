import { AdviceIcon } from "@/components/svg-components/advice-icon";
import { CalendarIcon } from "@/components/svg-components/calendar-icon";
import { ComplexityIcon } from "@/components/svg-components/complexity-icon";
import { ConfirmIcon } from "@/components/svg-components/confirm-icon";
import { DotMenuIcon } from "@/components/svg-components/dot-menu-icon";
import { HeartIcon } from "@/components/svg-components/heart-icon";
import { IconBadge } from "@/components/svg-components/icon-badge";
import NotificationIcon from "@/components/svg-components/notification-icon";
import { RedHeardIcon } from "@/components/svg-components/red-heard-icon";
import { TrashIcon } from "@/components/svg-components/trash-icon";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { HY } from "@/constants/hy";
import { routeForNotification } from "@/helpers/notificationRoute";
import { useDeleteNotification } from "@/hooks/notification/useDeleteNotification.hook";
import { useGetNotification } from "@/hooks/notification/useGetNotification.hook";
import { useGetUnreadCount } from "@/hooks/notification/useGetUnreadCount.hook";
import { useReadAllNotifications } from "@/hooks/notification/useReadAllNotifications.hook";
import { useReadNotification } from "@/hooks/notification/useReadNotification.hook";
import type { NotificationType } from "@/types/notification-type";
import dayjs from "dayjs";
import { useFocusEffect, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";
import Swipeable from "react-native-gesture-handler/ReanimatedSwipeable";

type Filter = "unread" | "read";

function dayNumber(createdAt: number) {
  const value = createdAt < 1e12 ? createdAt * 1000 : createdAt;
  return dayjs(value).format("DD,MM,YYYY");
}

export function NotificationsPanel() {
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>("unread");
  const [pendingDelete, setPendingDelete] = useState<NotificationType | null>(
    null,
  );

  const {
    notifications,
    isLoadingNotifications,
    isFetchingNextPage,
    hasNextPage,
    fetchNextPage,
    refetch,
    isError,
  } = useGetNotification({ is_read: filter === "read" });
  const { refetch: refetchUnreadCount } = useGetUnreadCount();

  useFocusEffect(
    useCallback(() => {
      setFilter("unread");
      void refetch();
      void refetchUnreadCount();
    }, [refetch, refetchUnreadCount]),
  );

  const readOne = useReadNotification();
  const readAll = useReadAllNotifications();
  const removeOne = useDeleteNotification();

  const onPressItem = (item: NotificationType) => {
    if (!item.isRead) {
      readOne.mutate({ id: item.id });
    }
    const href = routeForNotification(item);
    if (href) router.push(href as never);
  };

  const loadMore = () => {
    if (!hasNextPage || isFetchingNextPage) return;
    void fetchNextPage();
  };

  return (
    <View className="flex-1">
      <View className="flex-row items-center justify-start gap-2 px-4 mb-4">
        {(["unread", "read"] as const).map((value) => {
          const active = filter === value;
          return (
            <Pressable
              key={value}
              onPress={() => setFilter(value)}
              disabled={active && isLoadingNotifications}
              className={`rounded-lg border py-1 px-2 disabled:opacity-50 ${
                active
                  ? "border-brand-300 bg-brand-100"
                  : "border-brand-50 bg-white"
              }`}
              style={
                active
                  ? {
                      shadowColor: "#000",
                      shadowOffset: { width: 0, height: 1 },
                      shadowOpacity: 0.23,
                      shadowRadius: 2.62,
                      elevation: 4,
                    }
                  : {}
              }
            >
              <NotificationIcon
                isUnreadNotifications={value === "unread"}
                size={32}
              />
            </Pressable>
          );
        })}
        {filter === "unread" && notifications.length > 0 && (
          <Pressable
            onPress={() => readAll.mutate()}
            disabled={readAll.isPending}
            className="ml-[auto]"
          >
            <IconBadge>
              <ConfirmIcon />
            </IconBadge>
          </Pressable>
        )}
      </View>

      {isLoadingNotifications ? (
        <View className="flex-1 items-center justify-center">
          <ActivityIndicator color="#5d4081" />
        </View>
      ) : isError ? (
        <View className="flex-1 items-center justify-center px-4">
          <Text className="text-center text-sm text-calendar-danger">
            {HY.loadFailed}
          </Text>
        </View>
      ) : (
        <FlatList
          data={notifications}
          keyExtractor={(item) => String(item.id)}
          onEndReached={loadMore}
          onEndReachedThreshold={0.4}
          contentContainerClassName="px-4 pb-4"
          ListEmptyComponent={
            <Text className="mt-8 text-center text-sm text-grey-400">
              {HY.noNotifications}
            </Text>
          }
          ListFooterComponent={
            <View className="h-10 items-center justify-center">
              {isFetchingNextPage ? (
                <ActivityIndicator color="#5d4081" />
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <Swipeable
              renderRightActions={(_progress, _translation, methods) => (
                <Pressable
                  onPress={() => {
                    methods.close();
                    setPendingDelete(item);
                  }}
                  className="mb-3 justify-center rounded-br-[12px] rounded-tr-[12px] bg-red-600 px-4"
                >
                  <TrashIcon color="#ffffff" />
                </Pressable>
              )}
            >
              <Pressable
                onPress={() => onPressItem(item)}
                className={`bg-brand-100 border rounded-tl-[12px] rounded-bl-[12px] py-[4px] px-[8px]  border-brand-50 mb-3 flex-row items-center gap-3 ${
                  item.isRead ? "opacity-80" : "opacity-100"
                }`}
              >
                <View className="h-11 w-11 items-center justify-center ">
                  {item.type === "test_give_date" && <CalendarIcon />}
                  {item.type === "dosage" && <CalendarIcon />}
                  {item.type === "inr_result" && (
                    <RedHeardIcon color="#502E7F" />
                  )}
                  {item.type === "other" && <HeartIcon />}
                  {item.type === "advances" && <AdviceIcon />}
                  {item.type === "complicatiions" && <ComplexityIcon />}
                </View>
                <View className="min-w-0 flex-1">
                  <Text
                    className={`text-[15px] text-brand-700 ${
                      item.isRead ? "font-medium" : "font-bold"
                    }`}
                  >
                    {item.title}
                  </Text>
                  <Text className="mt-0.5 text-[13px] leading-5 text-grey-400">
                    {item.body}
                  </Text>
                  <View className="flex-row items-center gap-2">
                    <CalendarIcon color={"#979797"} />
                    <Text className="text-[13px] text-grey-500">
                      {dayNumber(item.createdAt)}
                    </Text>
                  </View>
                </View>
                <DotMenuIcon size={18} color="#979797" />
              </Pressable>
            </Swipeable>
          )}
        />
      )}

      <ConfirmModal
        visible={Boolean(pendingDelete)}
        title={HY.deleteNotificationConfirm}
        confirmLabel={HY.delete}
        destructive
        loading={removeOne.isPending}
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          if (!pendingDelete) return;
          removeOne.mutate(pendingDelete.id, {
            onSuccess: () => setPendingDelete(null),
          });
        }}
      />
    </View>
  );
}
