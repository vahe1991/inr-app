import { ApiPaths } from "@/constants/apiPaths";
import { useCan } from "@/hooks/usePermission.hook";
import { patientApi } from "@/services/patient";
import type {
  PatientListResponse,
  PatientsSearchType,
} from "@/types/patient-types";
import { useInfiniteQuery } from "@tanstack/react-query";

type PatientsListParams = Omit<PatientsSearchType, "page">;

/**
 * Same contract as the web hook, but paginated with an infinite query so the
 * mobile list can append pages while scrolling.
 */
export const usePatientsList = (params: PatientsListParams = {}) => {
  const pageSize = params.pageSize ?? 20;
  const allowed = useCan("GET", ApiPaths.patients);

  const query = useInfiniteQuery<PatientListResponse>({
    queryKey: ["patients-list", params.name ?? "", pageSize],
    queryFn: ({ pageParam }) =>
      patientApi.fetchPatientsList({
        name: params.name,
        page: pageParam as number,
        pageSize,
      }),
    initialPageParam: 1,
    getNextPageParam: (lastPage) => {
      const meta = lastPage.data.meta;
      return meta.page < meta.pageCount ? meta.page + 1 : undefined;
    },
    staleTime: Infinity,
    enabled: allowed,
  });

  const patientsList =
    query.data?.pages.flatMap((page) => page.data.items) ?? [];

  return {
    patientsList,
    meta: query.data?.pages.at(-1)?.data.meta,
    isLoading: query.isLoading,
    isFetching: query.isFetching,
    isFetchingNextPage: query.isFetchingNextPage,
    hasNextPage: Boolean(query.hasNextPage),
    fetchNextPage: query.fetchNextPage,
    refetch: query.refetch,
    isError: query.isError,
  };
};
