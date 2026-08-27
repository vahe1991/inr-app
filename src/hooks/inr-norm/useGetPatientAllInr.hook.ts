import { ApiPaths } from "@/constants/apiPaths";
import { useCan } from "@/hooks/usePermission.hook";
import { inrNormApi } from "@/services/inr-norm";
import type {
  PatientAllInrApiResponse,
  PatientAllInrType,
} from "@/types/inr-types";
import { useQuery } from "@tanstack/react-query";

export const useGetPatientAllInr = (
  params?: Record<string, string> & { patient_id: string },
) => {
  const allowed = useCan(
    "GET",
    ApiPaths.patientInr(params?.patient_id ?? "{patientId}"),
  );
  const { data, isLoading, refetch, isError, isFetching } = useQuery<
    PatientAllInrApiResponse,
    Error,
    PatientAllInrType
  >({
    queryKey: ["patient-all-inr", params],
    queryFn: () => inrNormApi.getPatientAllInr(params!),
    select: (response) => response.data,
    staleTime: Infinity,
    enabled: !!params?.patient_id && allowed,
  });

  return {
    allInr: data,
    isLoading,
    refetch,
    isError,
    isFetching,
  };
};
