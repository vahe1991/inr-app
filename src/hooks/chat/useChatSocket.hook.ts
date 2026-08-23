import { chatKeys } from "@/hooks/chat/keys";
import { connectChatSocket } from "@/services/chat-socket";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function useChatSocket(enabled: boolean) {
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!enabled) return;

    return connectChatSocket(() => {
      void queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      void queryClient.invalidateQueries({
        queryKey: chatKeys.notifications,
      });
      void queryClient.invalidateQueries({
        queryKey: chatKeys.unreadCount,
      });
    });
  }, [enabled, queryClient]);
}
