import { HY } from "@/constants/hy";
import { calendarApi } from "@/services/calendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Alert } from "react-native";

export const useMutateInrWarfarinDosage = (
  onSuccessCallback: (data: unknown) => void = () => {},
  onErrorCallback: (error: Error) => void = () => {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.mutateWarfarinDosage,
    mutationKey: ["mutate-warfarin-dosage"],
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["inr-warfarin-dosage"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["inr-warfarin-calendar"],
      });
      onSuccessCallback(data);
    },
    onError: (e: AxiosError) => {
      Alert.alert(
        HY.error,
        (e.response?.data as { message?: string })?.message ||
          "Դեղաչապի տվյալները պահպանել չհաջողվեց",
      );
      onErrorCallback(e);
    },
  });
};
