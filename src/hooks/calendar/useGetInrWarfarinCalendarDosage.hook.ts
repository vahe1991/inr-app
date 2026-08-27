import { ApiPaths } from "@/constants/apiPaths";
import { calendarApi } from "@/services/calendar";
import { useCan } from "@/hooks/usePermission.hook";
import type { InrWarfarinCalendarResponse } from "@/types/calendar-types";
import { useQuery } from "@tanstack/react-query";

export const useGetInrWarfarinCalendarDosage = (params: {
  patient_id: string;
  page?: number;
  pageSize?: number;
}) => {
  const allowed = useCan(
    "GET",
    ApiPaths.patientWarfarinCalendar(params.patient_id || "{patientId}"),
  );
  const { data, isLoading, refetch, isError, isFetching } = useQuery({
    queryKey: ["inr-warfarin-calendar", params],
    queryFn: () => calendarApi.getWarfarinCalendar(params),
    staleTime: Infinity,
    select: (data: InrWarfarinCalendarResponse) => data.data,
    enabled: !!params.patient_id && allowed,
  });

  return {
    calendarDosages: data,
    isLoadingCalendarDosage: isLoading,
    refetch,
    isError,
    isFetching,
  };
};
