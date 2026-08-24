import { asChatMessage } from "@/helpers/chatPayload";
import { useAuth } from "@/contexts/AuthContext";
import { appendChatMessage } from "@/hooks/chat/cache";
import { chatKeys } from "@/hooks/chat/keys";
import { storage } from "@/libs/storage";
import {
  connectChatWebSocket,
  disconnectChatWebSocket,
  getChatPresence,
  subscribeChatPresence,
} from "@/services/chat-socket";
import type { ChatInboxPageType, ChatMessagePageType } from "@/types/chat-type";
import {
  type InfiniteData,
  useQueryClient,
} from "@tanstack/react-query";
import { useEffect, useSyncExternalStore } from "react";

function refreshInbox(queryClient: ReturnType<typeof useQueryClient>) {
  void queryClient.invalidateQueries({ queryKey: chatKeys.notifications });
  void queryClient.invalidateQueries({ queryKey: chatKeys.unreadCount });
}

function asPatientId(value: unknown) {
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function refreshMessages(
  queryClient: ReturnType<typeof useQueryClient>,
  patientId?: number | null,
) {
  void (async () => {
    if (!patientId) {
      await queryClient.invalidateQueries({ queryKey: ["chat-messages"] });
      return;
    }
    const key = chatKeys.messages(patientId);
    const current = queryClient.getQueryData<ChatMessagePageType>(key);
    await queryClient.invalidateQueries({ queryKey: key });
    if (!current?.items.length) return;
    queryClient.setQueryData<ChatMessagePageType>(key, (page) => {
      const incoming = page?.items ?? [];
      const byId = new Map(incoming.map((item) => [item.id, item]));
      for (const item of current.items) {
        if (!byId.has(item.id)) byId.set(item.id, item);
      }
      return {
        items: [...byId.values()],
        hasMore: page?.hasMore ?? current.hasMore,
      };
    });
  })();
}

export function useChatSocket(enabled: boolean) {
  const queryClient = useQueryClient();
  const { setUserId } = useAuth();

  useEffect(() => {
    if (!enabled) return;

    let cancelled = false;

    void (async () => {
      const token = await storage.getToken();
      if (!token || cancelled) return;

      connectChatWebSocket(token, {
        onAuthOk: (id) => {
          if (id == null || id === "") return;
          setUserId(String(id));
        },
        onMessageNew: (patientId, message) => {
          const parsed = asChatMessage(message);
          const id =
            asPatientId(patientId) ??
            (parsed?.patientId ? parsed.patientId : null);
          if (id && parsed) {
            appendChatMessage(queryClient, id, parsed);
          } else {
            refreshMessages(queryClient, id);
          }
          refreshInbox(queryClient);
        },
        onNotificationUpdated: (patientId) => {
          refreshMessages(queryClient, asPatientId(patientId));
          refreshInbox(queryClient);
        },
        onNotificationsRead: (patientId) => {
          const id = asPatientId(patientId);
          if (id) {
            queryClient.setQueriesData<InfiniteData<ChatInboxPageType>>(
              { queryKey: chatKeys.notifications },
              (data) => {
                if (!data?.pages) return data;
                return {
                  ...data,
                  pages: data.pages.map((page) => ({
                    ...page,
                    items: page.items.map((item) =>
                      item.patientId === id
                        ? { ...item, isRead: true, unreadCount: 0 }
                        : item,
                    ),
                  })),
                };
              },
            );
          }
          void queryClient.invalidateQueries({
            queryKey: chatKeys.unreadCount,
          });
        },
      });
    })();

    return () => {
      cancelled = true;
      disconnectChatWebSocket();
    };
  }, [enabled, queryClient, setUserId]);
}

export function useChatPresence(patientId?: string | number) {
  const id = Number(patientId);
  const key = Number.isFinite(id) && id > 0 ? id : 0;
  return useSyncExternalStore(
    subscribeChatPresence,
    () => getChatPresence(key),
    () => getChatPresence(key),
  );
}
