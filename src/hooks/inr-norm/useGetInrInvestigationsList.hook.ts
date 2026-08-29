import { ApiPaths } from "@/constants/apiPaths";
import { useCan } from "@/hooks/usePermission.hook";
import { inrNormApi } from "@/services/inr-norm";
import type { InvestigationApiResponse } from "@/types/inr-types";
import { useQuery } from "@tanstack/react-query";

export const useInrInvestigationsList = (
  params?: Record<string, string | number>,
) => {
  const allowed = useCan("GET", ApiPaths.inr);
  const { data, isLoading, refetch, isError, isFetching } =
    useQuery<InvestigationApiResponse>({
      queryKey: ["inr-investigations", params],
      queryFn: () => inrNormApi.getInrInvestigations(params),
      staleTime: Infinity,
      enabled: allowed,
    });

  return {
    inrInvestigations: data?.data?.items,
    isLoading,
    refetch,
    isError,
    isFetching,
    meta: data?.data?.meta,
  };
};
