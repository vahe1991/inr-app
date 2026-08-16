import { inrNormApi } from "@/services/inr-norm";
import type { PatientInrResponse } from "@/types/inr-types";
import { useQuery } from "@tanstack/react-query";

export const useGetPatientInrNorm = (params: Record<string, string>) => {
  const { data, isLoading, refetch, isError, isFetching } =
    useQuery<PatientInrResponse>({
      queryKey: ["patient-inr-norm", params],
      queryFn: () => inrNormApi.getPatientInrNorm(params),
      staleTime: Infinity,
      enabled: !!params?.patient_id,
    });

  return {
    inrNorm: data?.data,
    isLoading,
    refetch,
    isError,
    isFetching,
  };
};
