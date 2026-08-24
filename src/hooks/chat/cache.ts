import { chatKeys } from "@/hooks/chat/keys";
import type { ChatMessagePageType, ChatMessageType } from "@/types/chat-type";
import type { QueryClient } from "@tanstack/react-query";

export function appendChatMessage(
  queryClient: QueryClient,
  patientId: string | number,
  message: ChatMessageType,
) {
  queryClient.setQueryData<ChatMessagePageType>(
    chatKeys.messages(patientId),
    (page) => {
      const items = page?.items ?? [];
      if (message.id && items.some((item) => item.id === message.id)) {
        return page ?? { items, hasMore: false };
      }
      return {
        items: [...items, message],
        hasMore: page?.hasMore ?? false,
      };
    },
  );
}

export function replaceChatMessage(
  queryClient: QueryClient,
  patientId: string | number,
  fromId: string,
  message: ChatMessageType,
) {
  queryClient.setQueryData<ChatMessagePageType>(
    chatKeys.messages(patientId),
    (page) => {
      const items = (page?.items ?? []).filter((item) => item.id !== fromId);
      if (message.id && items.some((item) => item.id === message.id)) {
        return { items, hasMore: page?.hasMore ?? false };
      }
      return {
        items: [...items, message],
        hasMore: page?.hasMore ?? false,
      };
    },
  );
}
