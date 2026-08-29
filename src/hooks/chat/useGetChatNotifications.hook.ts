import { asChatInboxPage } from "@/helpers/chatPayload";
import { ApiPaths } from "@/constants/apiPaths";
import { chatKeys } from "@/hooks/chat/keys";
import { useCan } from "@/hooks/usePermission.hook";
import { chatApi } from "@/services/chat";
import { useInfiniteQuery } from "@tanstack/react-query";

const PAGE_SIZE = 20;

export const useGetChatNotifications = () => {
  const allowed = useCan("GET", ApiPaths.chatNotifications);
  const query = useInfiniteQuery({
    queryKey: chatKeys.notifications,
    queryFn: async ({ pageParam }) =>
      asChatInboxPage(
        await chatApi.getChatNotifications({
          limit: PAGE_SIZE,
          offset: pageParam as number,
        }),
      ),
    initialPageParam: 0,
    getNextPageParam: (lastPage, pages) => {
      const loaded = pages.reduce((sum, page) => sum + page.items.length, 0);
      if (!lastPage.hasMore) return undefined;
      if (lastPage.items.length < PAGE_SIZE) return undefined;
      return loaded;
    },
    staleTime: 0,
    refetchOnMount: "always",
    enabled: allowed,
  });

  const lastPage = query.data?.pages.at(-1);

  return {
    items: query.data?.pages.flatMap((page) => page.items) ?? [],
    unreadCount: lastPage?.unreadCount ?? 0,
    totalCount: lastPage?.totalCount ?? 0,
    isLoadingInbox: query.isLoading,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: Boolean(query.hasNextPage),
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    isError: query.isError,
    isFetching: query.isFetching,
  };
};
