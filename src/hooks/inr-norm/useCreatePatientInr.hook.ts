import { HY } from "@/constants/hy";
import { inrNormApi } from "@/services/inr-norm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useCreatePatientInr = (
  onSuccessCallback = () => {},
  onErrorCallback = () => {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inrNormApi.createPatientInr,
    mutationKey: ["create-patient-inr"],
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["patient-all-inr"],
      });
      await queryClient.invalidateQueries({
        queryKey: ["patient-inr", { patient_id: variables.id }],
      });
      onSuccessCallback();
    },
    onError: () => {
      Alert.alert(HY.error, "INR արդյունքը պահպանել չհաջողվեց");
      onErrorCallback();
    },
  });
};
