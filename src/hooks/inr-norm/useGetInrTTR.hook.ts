import { inrNormApi } from "@/services/inr-norm";
import { useQuery } from "@tanstack/react-query";

export const useGetInrTTR = (patientId: string) => {
  const { data, isLoading, refetch, isError, isFetching } = useQuery({
    queryKey: ["patient-inr-ttr", patientId],
    queryFn: () => inrNormApi.fetchInrTTR(patientId),
    staleTime: Infinity,
    enabled: !!patientId,
    select: (response) => response.data,
  });

  return {
    inrTTRData: data,
    isLoading,
    refetch,
    isError,
    isFetching,
  };
};
