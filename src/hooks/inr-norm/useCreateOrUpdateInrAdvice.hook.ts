import { HY } from "@/constants/hy";
import { inrNormApi } from "@/services/inr-norm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useCreateOrUpdatePatientAdvice = (
  onSuccessCallback: (data: unknown) => void = () => {},
  onErrorCallback: (error: Error) => void = () => {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inrNormApi.createOrUpdatePatientInrAdvice,
    mutationKey: ["create-or-update-inr-advice"],
    onSuccess: async (data) => {
      Alert.alert(HY.saved, "Պացիենտի տվյալները պահպանվեցին");
      await queryClient.invalidateQueries({
        queryKey: ["patient-inr-advice"],
      });
      onSuccessCallback(data);
    },
    onError: (e) => {
      Alert.alert(HY.error, "Պացիենտի տվյալները պահպանել չհաջողվեց");
      onErrorCallback(e);
    },
  });
};
