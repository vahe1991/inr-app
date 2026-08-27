import { ApiPaths } from "@/constants/apiPaths";
import { useCan } from "@/hooks/usePermission.hook";
import { inrNormApi } from "@/services/inr-norm";
import type {
  InrComplicationApiResponse,
  InrComplicationResponse,
} from "@/types/patient-types";
import { useQuery } from "@tanstack/react-query";

export const useGetPatientInrComplication = (
  params: Record<string, string>,
) => {
  const allowed = useCan(
    "GET",
    ApiPaths.patientInrComplication(params.patient_id ?? "{patientId}"),
  );
  const { data, isLoading, refetch, isError, isFetching } = useQuery<
    InrComplicationApiResponse,
    Error,
    InrComplicationResponse
  >({
    queryKey: ["patient-inr-complication", params],
    queryFn: () => inrNormApi.getPatientInrComplication(params),
    staleTime: Infinity,
    enabled: !!params?.patient_id && allowed,
    select: (data) => data.data,
  });

  return {
    inrComplication: data?.items,
    meta: data?.meta,
    isLoadingComplication: isLoading,
    refetch,
    isError,
    isFetching,
  };
};
