import { ApiPaths } from "@/constants/apiPaths";
import { useCan } from "@/hooks/usePermission.hook";
import { inrNormApi } from "@/services/inr-norm";
import type {
  InrAdviceApiResponse,
  InrAdviceResponse,
} from "@/types/patient-types";
import { useQuery } from "@tanstack/react-query";

export const useGetPatentInrAdvice = (params: Record<string, string>) => {
  const allowed = useCan(
    "GET",
    ApiPaths.patientInrAdvice(params.patient_id ?? "{patientId}"),
  );
  const { data, isLoading, refetch, isError, isFetching } = useQuery<
    InrAdviceApiResponse,
    Error,
    InrAdviceResponse
  >({
    queryKey: ["patient-inr-advice", params],
    queryFn: () => inrNormApi.getPatientInrAdvice(params),
    staleTime: Infinity,
    enabled: !!params?.patient_id && allowed,
    select: (data) => data.data,
  });

  return {
    inrAdvice: data?.items,
    meta: data?.meta,
    isLoadingAdvice: isLoading,
    refetch,
    isError,
    isFetching,
  };
};
