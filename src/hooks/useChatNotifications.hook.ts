import {
  chatQueryKeys,
  getChatNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "@/services/chat.api";
import {
  useInfiniteQuery,
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

const PAGE_SIZE = 20;

export function useChatNotifications() {
  const queryClient = useQueryClient();

  const query = useInfiniteQuery({
    queryKey: chatQueryKeys.notifications(),
    queryFn: ({ pageParam }) => getChatNotifications(pageParam, PAGE_SIZE),
    initialPageParam: 0,
    getNextPageParam: (lastPage, _pages, lastPageParam) =>
      lastPage.hasMore ? lastPageParam + PAGE_SIZE : undefined,
  });

  const notifications = query.data?.pages.flatMap((page) => page.items) ?? [];

  const markReadMutation = useMutation({
    mutationFn: markNotificationAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.all });
    },
  });

  const markAllReadMutation = useMutation({
    mutationFn: markAllNotificationsAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.all });
    },
  });

  return {
    notifications,
    isLoading: query.isLoading,
    isError: query.isError,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: query.hasNextPage,
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    markAsRead: markReadMutation.mutateAsync,
    markAllAsRead: markAllReadMutation.mutateAsync,
    isMarkingRead: markReadMutation.isPending,
    isMarkingAllRead: markAllReadMutation.isPending,
  };
}
