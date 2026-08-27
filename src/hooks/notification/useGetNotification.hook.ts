import { ApiPaths } from "@/constants/apiPaths";
import { useCan } from "@/hooks/usePermission.hook";
import { notificationApi } from "@/services/notification";
import type {
  NotificationDataType,
  NotificationRequestType,
  NotificationResponseType,
} from "@/types/notification-type";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 10;

function asPage(res: unknown): NotificationDataType {
  const body = (res as { data?: unknown })?.data;
  if (body && typeof body === "object" && "notifications" in body) {
    return body as NotificationDataType;
  }
  const nested = (body as NotificationResponseType | undefined)?.data;
  if (nested?.notifications) return nested;
  return {
    notifications: [],
    unreadCount: 0,
    totalCount: 0,
    limit: PAGE_SIZE,
    offset: 0,
  };
}

export const useGetNotification = (
  params: Omit<NotificationRequestType, "limit" | "offset"> = {},
) => {
  const allowed = useCan("GET", ApiPaths.notifications);
  const query = useInfiniteQuery({
    queryKey: ["notifications", params],
    queryFn: async ({ pageParam }) =>
      asPage(
        await notificationApi.getNotifications({
          ...params,
          limit: PAGE_SIZE,
          offset: pageParam as number,
        }),
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce(
        (sum, page) => sum + page.notifications.length,
        0,
      );
      if (lastPage.notifications.length < PAGE_SIZE) return undefined;
      if (lastPage.totalCount && loaded >= lastPage.totalCount) {
        return undefined;
      }
      return loaded;
    },
    staleTime: 0,
    refetchOnMount: "always",
    enabled: allowed,
  });

  const lastPage = query.data?.pages.at(-1);

  return {
    notifications:
      query.data?.pages.flatMap((page) => page.notifications) ?? [],
    unreadCount: lastPage?.unreadCount ?? 0,
    totalCount: lastPage?.totalCount ?? 0,
    isLoadingNotifications: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: Boolean(query.hasNextPage),
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    isError: query.isError,
    isFetching: query.isFetching,
  };
};
