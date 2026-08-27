import { ApiPaths } from "@/constants/apiPaths";
import { useCan } from "@/hooks/usePermission.hook";
import { inrNormApi } from "@/services/inr-norm";
import type { PatientInrResponse } from "@/types/inr-types";
import { useQuery } from "@tanstack/react-query";

export const useGetPatientInrNorm = (params: Record<string, string>) => {
  const allowed = useCan(
    "GET",
    ApiPaths.patientInrNorm(params.patient_id ?? "{patientId}"),
  );
  const { data, isLoading, refetch, isError, isFetching } =
    useQuery<PatientInrResponse>({
      queryKey: ["patient-inr-norm", params],
      queryFn: () => inrNormApi.getPatientInrNorm(params),
      staleTime: Infinity,
      enabled: !!params?.patient_id && allowed,
    });

  return {
    inrNorm: data?.data,
    isLoading,
    refetch,
    isError,
    isFetching,
  };
};
