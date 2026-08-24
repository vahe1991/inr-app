import { HY } from "@/constants/hy";
import { useAuth } from "@/contexts/AuthContext";
import { asChatMessageFromResponse } from "@/helpers/chatPayload";
import { appendChatMessage, replaceChatMessage } from "@/hooks/chat/cache";
import { chatKeys } from "@/hooks/chat/keys";
import { chatApi } from "@/services/chat";
import type { ChatMessageType } from "@/types/chat-type";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useSendChatMessage = (
  onSuccessCallback: (data: unknown) => void = () => {},
  onErrorCallback: (error: Error) => void = () => {},
) => {
  const queryClient = useQueryClient();
  const { userId, name } = useAuth();

  return useMutation({
    mutationFn: chatApi.sendChatsMessage,
    mutationKey: ["send-chat-message"],
    onMutate: async (variables) => {
      const key = chatKeys.messages(variables.patient_id);
      await queryClient.cancelQueries({ queryKey: key });
      const previous = queryClient.getQueryData(key);
      const tempId = `temp-${Date.now()}`;
      const optimistic: ChatMessageType = {
        id: tempId,
        patientId: Number(variables.patient_id) || 0,
        senderId: userId ?? "",
        senderName: name ?? "",
        senderRole: "doctor",
        type: variables.file?.type?.startsWith("image/")
          ? "image"
          : variables.file
            ? "file"
            : "text",
        content: variables.content,
        attachments: variables.file
          ? [
              {
                id: tempId,
                name: variables.file.name,
                url: variables.file.uri,
                mimeType: variables.file.type,
                size: 0,
              },
            ]
          : [],
        status: "sending",
        createdAt: new Date().toISOString(),
        isRead: true,
      };
      appendChatMessage(queryClient, variables.patient_id, optimistic);
      return { previous, tempId };
    },
    onSuccess: async (data, variables, context) => {
      const parsed = asChatMessageFromResponse(data);
      const message: ChatMessageType = {
        id: parsed?.id || context?.tempId || `sent-${Date.now()}`,
        patientId:
          parsed?.patientId || Number(variables.patient_id) || 0,
        senderId: parsed?.senderId || userId || "",
        senderName: parsed?.senderName || name || "",
        senderRole: parsed?.senderRole || "doctor",
        senderPhoto: parsed?.senderPhoto,
        type: parsed?.type || (variables.file ? "file" : "text"),
        content: parsed?.content || variables.content,
        attachments: parsed?.attachments?.length
          ? parsed.attachments
          : variables.file
            ? [
                {
                  id: context?.tempId || "",
                  name: variables.file.name,
                  url: variables.file.uri,
                  mimeType: variables.file.type,
                  size: 0,
                },
              ]
            : [],
        status: "sent",
        createdAt: parsed?.createdAt || new Date().toISOString(),
        isRead: true,
      };
      if (context?.tempId) {
        replaceChatMessage(
          queryClient,
          variables.patient_id,
          context.tempId,
          message,
        );
      } else {
        appendChatMessage(queryClient, variables.patient_id, message);
      }
      void queryClient.invalidateQueries({
        queryKey: chatKeys.notifications,
      });
      void queryClient.invalidateQueries({
        queryKey: chatKeys.unreadCount,
      });
      onSuccessCallback(data);
    },
    onError: (error, variables, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          chatKeys.messages(variables.patient_id),
          context.previous,
        );
      }
      Alert.alert(HY.error, HY.sendMessageFailed);
      onErrorCallback(error);
    },
  });
};
