import { asUnreadCount } from "@/helpers/chatPayload";
import { chatKeys } from "@/hooks/chat/keys";
import { chatApi } from "@/services/chat";
import { useQuery } from "@tanstack/react-query";

export const useGetChatUnreadCount = () => {
  const { data, isLoading, refetch, isError, isFetching } = useQuery({
    queryKey: chatKeys.unreadCount,
    queryFn: () => chatApi.getChatUnreadCount(),
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
