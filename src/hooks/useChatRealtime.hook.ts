import {
  chatQueryKeys,
  getUnreadChatCount,
  startChatSimulation,
  subscribeToChatEvents,
} from "@/services/chat.api";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

/** Keeps unread badge in sync and starts demo real-time simulation. */
export function useChatRealtime(): void {
  const queryClient = useQueryClient();

  useEffect(() => {
    const stopSimulation = startChatSimulation();

    const unsubscribe = subscribeToChatEvents(() => {
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.all });
    });

    return () => {
      unsubscribe();
      stopSimulation();
    };
  }, [queryClient]);
}

export function useUnreadChatCount() {
  const query = useQuery({
    queryKey: chatQueryKeys.unreadCount(),
    queryFn: getUnreadChatCount,
    refetchInterval: 5_000,
  });

  return {
    unreadCount: query.data ?? 0,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: query.refetch,
  };
}
