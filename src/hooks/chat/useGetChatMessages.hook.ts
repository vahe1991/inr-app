import { asChatMessagePage } from "@/helpers/chatPayload";
import { chatKeys } from "@/hooks/chat/keys";
import { chatApi } from "@/services/chat";
import { useQuery } from "@tanstack/react-query";

const MESSAGE_LIMIT = 100;

export const useGetChatMessages = (patient_id?: string | number) => {
  const enabled = patient_id != null && String(patient_id).length > 0;

  const query = useQuery({
    queryKey: chatKeys.messages(patient_id ?? ""),
    queryFn: async () =>
      asChatMessagePage(
        await chatApi.getChatsMessages({
          patient_id: patient_id!,
          limit: MESSAGE_LIMIT,
        }),
      ),
    enabled,
    staleTime: 0,
    refetchOnMount: "always",
  });

  return {
    messages: query.data?.items ?? [],
    hasMore: query.data?.hasMore ?? false,
    isLoadingMessages: query.isLoading,
    refetch: query.refetch,
    isError: query.isError,
    isFetching: query.isFetching,
  };
};
