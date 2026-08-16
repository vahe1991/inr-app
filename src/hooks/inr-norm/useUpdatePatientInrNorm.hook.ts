import { HY } from "@/constants/hy";
import { inrNormApi } from "@/services/inr-norm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useUpdatePatientInrNorm = (
  onSuccessCallback: (data: unknown) => void = () => {},
  onErrorCallback: (error: Error) => void = () => {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inrNormApi.updatePatientInrNorm,
    mutationKey: ["update-patient-inr-norm"],
    onSuccess: async (data) => {
      Alert.alert(HY.saved, "Պացիենտի տվյալները պահպանվեցին");
      await queryClient.invalidateQueries({
        queryKey: ["patient-inr-norm"],
      });
      onSuccessCallback(data);
    },
    onError: (e) => {
      Alert.alert(HY.error, "Պացիենտի տվյալները պահպանել չհաջողվեց");
      onErrorCallback(e);
    },
  });
};
