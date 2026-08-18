import { HY } from "@/constants/hy";
import { inrNormApi } from "@/services/inr-norm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useCreateOrUpdateInrComplication = (
  onSuccessCallback: (data: unknown) => void = () => {},
  onErrorCallback: (error: Error) => void = () => {},
) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: inrNormApi.createOrUpdateInrComplication,
    mutationKey: ["create-or-update-inr-complication"],
    onSuccess: async (data) => {
      await queryClient.invalidateQueries({
        queryKey: ["patient-inr-complication"],
      });
      onSuccessCallback(data);
    },
    onError: (e) => {
      Alert.alert(HY.error, "Պացիենտի տվյալները պահպանել չհաջողվեց");
      onErrorCallback(e);
    },
  });
};
