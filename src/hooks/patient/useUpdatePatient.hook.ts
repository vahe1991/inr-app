import { HY } from "@/constants/hy";
import { patientApi } from "@/services/patient";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export const useUpdatePatient = (
  onSuccessCallback = () => {},
  onErrorCallback = () => {},
) => {
  const client = useQueryClient();

  return useMutation({
    mutationFn: patientApi.editPatient,
    mutationKey: ["update-patient"],
    onSuccess: async (_data, variables) => {
      await client.invalidateQueries({
        queryKey: ["patient-by-id", variables.patient_id],
      });
      Alert.alert(HY.saved, "Պացիենտի տվյալները պահպանվեցին");
      onSuccessCallback();
    },
    onError: () => {
      Alert.alert(HY.error, "Պացիենտի տվյալները պահպանել չհաջողվեց");
      onErrorCallback();
    },
  });
};
