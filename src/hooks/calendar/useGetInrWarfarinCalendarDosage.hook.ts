import { calendarApi } from "@/services/calendar";
import type { InrWarfarinCalendarResponse } from "@/types/calendar-types";
import { useQuery } from "@tanstack/react-query";

export const useGetInrWarfarinCalendarDosage = (params: {
  patient_id: string;
  page?: number;
  pageSize?: number;
}) => {
  const { data, isLoading, refetch, isError, isFetching } = useQuery({
    queryKey: ["inr-warfarin-calendar", params],
    queryFn: () => calendarApi.getWarfarinCalendar(params),
    staleTime: Infinity,
    select: (data: InrWarfarinCalendarResponse) => data.data,
    enabled: !!params.patient_id,
  });

  return {
    calendarDosages: data,
    isLoadingCalendarDosage: isLoading,
    refetch,
    isError,
    isFetching,
  };
};
