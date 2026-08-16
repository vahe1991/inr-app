import {
  chatQueryKeys,
  getPatientMessages,
  markPatientChatAsRead,
  retryFailedMessage,
  sendChatMessage,
  setActiveChatPatient,
  uploadChatFile,
} from "@/services/chat.api";
import type { SendMessagePayload } from "@/types/chat.types";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";

export function usePatientChat(patientId: number | null, isActive = false) {
  const queryClient = useQueryClient();
  const enabled = patientId != null && Number.isFinite(patientId);

  useEffect(() => {
    if (isActive && enabled) {
      setActiveChatPatient(patientId);
      markPatientChatAsRead(patientId).then(() => {
        queryClient.invalidateQueries({ queryKey: chatQueryKeys.all });
      });
    } else if (!isActive) {
      setActiveChatPatient(null);
    }

    return () => {
      if (isActive) setActiveChatPatient(null);
    };
  }, [patientId, isActive, enabled, queryClient]);

  const messagesQuery = useQuery({
    queryKey: chatQueryKeys.messages(patientId ?? 0),
    queryFn: () => getPatientMessages(patientId!),
    enabled,
  });

  const sendMutation = useMutation({
    mutationFn: (payload: SendMessagePayload) => sendChatMessage(payload),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.messages(variables.patientId),
      });
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.all });
    },
  });

  const uploadMutation = useMutation({
    mutationFn: uploadChatFile,
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.messages(variables.patientId),
      });
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.all });
    },
  });

  const retryMutation = useMutation({
    mutationFn: retryFailedMessage,
    onSuccess: (message) => {
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.messages(message.patientId),
      });
    },
  });

  return {
    messages: messagesQuery.data ?? [],
    isLoading: messagesQuery.isLoading,
    isError: messagesQuery.isError,
    error: messagesQuery.error,
    refetch: messagesQuery.refetch,
    sendMessage: sendMutation.mutateAsync,
    uploadFile: uploadMutation.mutateAsync,
    retryMessage: retryMutation.mutateAsync,
    isSending: sendMutation.isPending || uploadMutation.isPending,
  };
}

export function usePatientChatUpload(patientId: number) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: uploadChatFile,
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: chatQueryKeys.messages(patientId),
      });
      queryClient.invalidateQueries({ queryKey: chatQueryKeys.all });
    },
  });
}
