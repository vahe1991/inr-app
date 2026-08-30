import { HY } from "@/constants/hy";
import { calendarApi } from "@/services/calendar";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useDeleteInrCycle = (
  onSuccessCallback: (data: unknown) => void = () => {},
  onErrorCallback: (error: Error) => void = () => {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: calendarApi.deleteInrCycle,
    mutationKey: ["delete-inr-cycle"],
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["inr-cycle"],
      });
      onSuccessCallback(data);
    },
    onError: (e) => {
      Alert.alert(HY.error, "Ցիկլը հեռացնել չհաջողվեց");
      onErrorCallback(e);
    },
  });
};
