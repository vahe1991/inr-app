import { HY } from "@/constants/hy";
import { calendarApi } from "@/services/calendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useMutateWarfarinCalendar = (
  onSuccessCallback: (data: unknown) => void = () => {},
  onErrorCallback: (error: Error) => void = () => {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.mutateWarfarinCalendar,
    mutationKey: ["mutate-warfarin-calendar"],
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["inr-warfarin-dosage"],
      });
      onSuccessCallback(data);
    },
    onError: (e) => {
      Alert.alert(HY.error, "Դեղաչապի տվյալները պահպանել չհաջողվեց");
      onErrorCallback(e);
    },
  });
};
