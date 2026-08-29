import { ApiPaths } from "@/constants/apiPaths";
import { locationsApi } from "@/services/locations";
import { useCan } from "@/hooks/usePermission.hook";
import { useQuery } from "@tanstack/react-query";

export const useLocations = () => {
  const allowed = useCan("GET", ApiPaths.locations);
  const { data, isLoading, refetch, isError, isFetching } = useQuery({
    queryKey: ["locations"],
    queryFn: () => locationsApi.fetchLocationsList(),
    staleTime: Infinity,
    enabled: allowed,
    select: (data) =>
      data?.data?.data?.map((l) => ({ label: l?.name, value: l?.id, ...l })),
  });

  return {
    locations: data,
    isLoading,
    refetch,
    isError,
    isFetching,
  };
};
