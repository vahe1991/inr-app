import { notificationApi } from "@/services/notification";
import { useQuery } from "@tanstack/react-query";

function asUnreadCount(res: unknown) {
  const body = (res as { data?: unknown })?.data;
  if (typeof body === "number") return body;
  if (body && typeof body === "object") {
    const row = body as {
      unreadCount?: number;
      count?: number;
      data?: { unreadCount?: number; count?: number };
    };
    return (
      row.unreadCount ?? row.count ?? row.data?.unreadCount ?? row.data?.count ?? 0
    );
  }
  return 0;
}

export const useGetUnreadCount = () => {
  const { data, isLoading, refetch, isError, isFetching } = useQuery({
    queryKey: ["notifications-unread-count"],
    queryFn: () => notificationApi.getUnreadCount(),
    staleTime: 0,
    refetchOnMount: "always",
    select: asUnreadCount,
  });

  return {
    unreadCount: data ?? 0,
    isLoadingUnreadCount: isLoading,
    refetch,
    isError,
    isFetching,
  };
};
