import { HY } from "@/constants/hy";
import { calendarApi } from "@/services/calendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useMutateInrWarfarinDosage = (
  onSuccessCallback: (data: unknown) => void = () => {},
  onErrorCallback: (error: Error) => void = () => {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.mutateInrCycle,
    mutationKey: ["mutate-inr-cycle"],
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["inr-circle"],
      });
      onSuccessCallback(data);
    },
    onError: (e) => {
      Alert.alert(HY.error, "Դեղաչապի տվյալները փոփոխել չհաջողվեց");
      onErrorCallback(e);
    },
  });
};
