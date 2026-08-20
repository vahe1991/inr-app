import { calendarApi } from "@/services/calendar";
import { InrWarfarinCalendarResponse } from "@/types/calendar-types";

import { useQuery } from "@tanstack/react-query";

export const useGetInrCircle = (params: {
  doctor_id: string;
  patient_id: string;
}) => {
  const { data, isLoading, refetch, isError, isFetching } = useQuery({
    queryKey: ["inr-circle", params],
    queryFn: () => calendarApi.getInrCycle(params),
    staleTime: Infinity,
    select: (data: InrWarfarinCalendarResponse) => data.data,
    enabled: !!params.patient_id,
  });

  return {
    inrCircle: data ?? [],
    isLoadingInrCircle: isLoading,
    refetch,
    isError,
    isFetching,
  };
};
