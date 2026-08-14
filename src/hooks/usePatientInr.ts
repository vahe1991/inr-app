import { inrNormApi } from "@/services/inr-norm";
import type {
  PatientAllInrApiResponse,
  PatientInrResponse,
} from "@/types/inr-types";
import type {
  InrAdviceApiResponse,
  InrComplicationApiResponse,
} from "@/types/patient-types";
import { useQuery } from "@tanstack/react-query";

export const usePatientAllInr = (patientId?: string) => {
  const { data, isLoading, isError, refetch } =
    useQuery<PatientAllInrApiResponse>({
      queryKey: ["patient-all-inr", patientId],
      queryFn: () =>
        inrNormApi.getPatientAllInr({
          patient_id: patientId!,
          page: "1",
          pageSize: "50",
        }),
      enabled: !!patientId,
    });

  return {
    items: data?.data.items ?? [],
    meta: data?.data.meta,
    isLoading,
    isError,
    refetch,
  };
};

export const usePatientInrNorm = (patientId?: string) => {
  const { data, isLoading, refetch } = useQuery<PatientInrResponse>({
    queryKey: ["patient-inr-norm", patientId],
    queryFn: () =>
      inrNormApi.getPatientInrNorm({
        patient_id: patientId!,
        date: new Date().toISOString().slice(0, 10),
      }),
    enabled: !!patientId,
  });

  return { norm: data?.data, isLoading, refetch };
};

export const usePatientInrAdvice = (patientId?: string) => {
  const { data, isLoading } = useQuery<InrAdviceApiResponse>({
    queryKey: ["patient-inr-advice", patientId],
    queryFn: () =>
      inrNormApi.getPatientInrAdvice({
        patient_id: patientId!,
        page: "1",
        pageSize: "20",
      }),
    enabled: !!patientId,
  });

  return { items: data?.data.items ?? [], isLoading };
};

export const usePatientInrComplication = (patientId?: string) => {
  const { data, isLoading } = useQuery<InrComplicationApiResponse>({
    queryKey: ["patient-inr-complication", patientId],
    queryFn: () =>
      inrNormApi.getPatientInrComplication({
        patient_id: patientId!,
        page: "1",
        pageSize: "20",
      }),
    enabled: !!patientId,
  });

  return { items: data?.data.items ?? [], isLoading };
};
