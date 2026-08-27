import { ApiPaths } from "@/constants/apiPaths";
import { calendarApi } from "@/services/calendar";
import { InrWarfarinCalendarResponse } from "@/types/calendar-types";
import { useCan } from "@/hooks/usePermission.hook";

import { useQuery } from "@tanstack/react-query";

export const useGetInrCircle = (params: {
  doctor_id: string;
  patient_id: string;
}) => {
  const allowed = useCan("GET", ApiPaths.inrCycle);
  const { data, isLoading, refetch, isError, isFetching } = useQuery({
    queryKey: ["inr-circle", params],
    queryFn: () => calendarApi.getInrCycle(params),
    staleTime: Infinity,
    select: (data: InrWarfarinCalendarResponse) => data.data,
    enabled: !!params.patient_id && allowed,
  });

  return {
    inrCircle: data ?? [],
    isLoadingInrCircle: isLoading,
    refetch,
    isError,
    isFetching,
  };
};
