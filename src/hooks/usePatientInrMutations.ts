import { inrNormApi } from "@/services/inr-norm";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Alert } from "react-native";

export function useCreatePatientInr(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-patient-inr"],
    mutationFn: inrNormApi.createPatientInr,
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ["patient-all-inr"] });
      onSuccess?.();
    },
    onError: () => {
      Alert.alert("Սխալ", "INR արդյունքը պահպանել չհաջողվեց");
    },
  });
}

export function useUpdatePatientInrNorm(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["update-patient-inr-norm"],
    mutationFn: inrNormApi.updatePatientInrNorm,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["patient-inr-norm", String(variables.patient_id)],
      });
      onSuccess?.();
    },
    onError: () => {
      Alert.alert("Սխալ", "INR նորման պահպանել չհաջողվեց");
    },
  });
}

export function useCreateOrUpdatePatientAdvice(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-or-update-inr-advice"],
    mutationFn: inrNormApi.createOrUpdatePatientInrAdvice,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["patient-inr-advice", String(variables.patient_id)],
      });
      onSuccess?.();
    },
    onError: () => {
      Alert.alert("Սխալ", "Խորհուրդը պահպանել չհաջողվեց");
    },
  });
}

export function useCreateOrUpdateInrComplication(onSuccess?: () => void) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationKey: ["create-or-update-inr-complication"],
    mutationFn: inrNormApi.createOrUpdateInrComplication,
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({
        queryKey: ["patient-inr-complication", String(variables.patient_id)],
      });
      onSuccess?.();
    },
    onError: () => {
      Alert.alert("Սխալ", "Բարդությունը պահպանել չհաջողվեց");
    },
  });
}
