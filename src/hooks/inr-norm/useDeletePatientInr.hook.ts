import { HY } from "@/constants/hy";
import { inrNormApi } from "@/services/inr-norm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useDeletePatientInr = (
  onSuccessCallback = () => {},
  onErrorCallback = () => {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inrNormApi.deletePatientInrNorm,
    mutationKey: ["delete-patient-inr"],
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["patient-all-inr"] });
      onSuccessCallback();
    },
    onError: () => {
      Alert.alert(HY.error, "Պացիենտի տվյալները հեռացնել չհաջողվեց");
      onErrorCallback();
    },
  });
};
