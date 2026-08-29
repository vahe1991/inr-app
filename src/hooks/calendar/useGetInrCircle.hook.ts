import { ApiPaths } from "@/constants/apiPaths";
import { useCan } from "@/hooks/usePermission.hook";
import { calendarApi } from "@/services/calendar";
import type { InrCycleData, InrCycleResponse } from "@/types/calendar-types";

import { useQuery } from "@tanstack/react-query";

export const useGetInrCircle = (params: { doctor_id?: string | number }) => {
  const allowed = useCan("GET", ApiPaths.inrCycle);
  const { data, isLoading, refetch, isError, isFetching } = useQuery<
    InrCycleResponse,
    Error,
    InrCycleData
  >({
    queryKey: ["inr-circle", params],
    queryFn: () => calendarApi.getInrCycle(params),
    staleTime: Infinity,
    select: (response) => response.data,
    enabled: !!params.doctor_id && allowed,
  });

  return {
    inrCircle: data ?? { cycles: [] },
    isLoadingInrCircle: isLoading,
    refetch,
    isError,
    isFetching,
  };
};
