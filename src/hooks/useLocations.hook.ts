import { locationsApi } from "@/services/locations";
import { useQuery } from "@tanstack/react-query";

export const useLocations = () => {
  const { data, isLoading, refetch, isError, isFetching } = useQuery({
    queryKey: ["locations"],
    queryFn: () => locationsApi.fetchLocationsList(),
    staleTime: Infinity,
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
