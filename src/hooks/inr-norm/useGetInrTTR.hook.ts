import { ApiPaths } from "@/constants/apiPaths";
import { useCan } from "@/hooks/usePermission.hook";
import { inrNormApi } from "@/services/inr-norm";
import { useQuery } from "@tanstack/react-query";

export const useGetInrTTR = (patientId: string) => {
  const allowed = useCan("GET", ApiPaths.inrTtr);
  const { data, isLoading, refetch, isError, isFetching } = useQuery({
    queryKey: ["patient-inr-ttr", patientId],
    queryFn: () => inrNormApi.fetchInrTTR(patientId),
    staleTime: Infinity,
    enabled: !!patientId && allowed,
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
