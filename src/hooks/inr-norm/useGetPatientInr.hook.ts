import { inrNormApi } from "@/services/inr-norm";
import type { PatientInrResponse, PatientInrType } from "@/types/inr-types";
import { useQuery } from "@tanstack/react-query";

export const useGetPatientInr = (params: {
  patient_id: string | number;
  date: string;
}) => {
  const { data, isLoading, refetch, isError, isFetching } = useQuery<
    PatientInrResponse,
    Error,
    PatientInrType
  >({
    queryKey: ["patient-inr", params],
    queryFn: () => inrNormApi.getPatientInr(params),
    staleTime: Infinity,
    enabled: !!params?.patient_id,
    select: (response) => response.data,
  });

  return {
    inrPatentData: data,
    isLoading,
    refetch,
    isError,
    isFetching,
  };
};
