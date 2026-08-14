import { patientApi } from "@/services/patient";
import type { PatientResponse } from "@/types/patient-types";
import { useQuery } from "@tanstack/react-query";

export const usePatientById = (patient_id?: string) => {
  const { data, isLoading, refetch, isError, isFetching } =
    useQuery<PatientResponse>({
      queryKey: ["patient-by-id", patient_id],
      queryFn: () => patientApi.getPatientById(patient_id),
      staleTime: Infinity,
      enabled: !!patient_id,
    });

  return {
    patient: data?.data,
    isLoading,
    refetch,
    isError,
    isFetching,
  };
};
