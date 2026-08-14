import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { HY } from "@/constants/hy";
import { useInrInvestigationsList } from "@/hooks/useInrInvestigations";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  ActivityIndicator,
  FlatList,
  Pressable,
  Text,
  View,
} from "react-native";

export default function InvestigationsScreen() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const { inrInvestigations, meta, isLoading, isFetching, isError } =
    useInrInvestigationsList({ page, pageSize: 20 });

  return (
    <AuthenticatedScreen contentClassName="flex-1 px-4 pt-4">
      <Text className="mb-3 text-xl font-semibold text-grey-900">
        {HY.labTitle}
      </Text>

      {isLoading && page === 1 ? (
        <LoadingScreen />
      ) : isError ? (
        <View className="flex-1 items-center justify-center">
          <Text className="text-sm text-calendar-danger">{HY.labFailed}</Text>
        </View>
      ) : (
        <FlatList
          data={inrInvestigations}
          keyExtractor={(item) => String(item.id)}
          renderItem={({ item }) => (
            <Pressable
              onPress={() =>
                router.push({
                  pathname: "/patient/[patientId]",
                  params: { patientId: String(item.patientId) },
                })
              }
              className="mb-3 rounded-xl border border-calendar-border bg-white p-4 active:bg-brand-100"
            >
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="flex-1 text-base font-semibold text-brand-700">
                  {item.patient?.fullName ?? `#${item.patientId}`}
                </Text>
                <View className="rounded-calendar-pill bg-calendar-primary px-2.5 py-0.5">
                  <Text className="text-xs font-semibold text-white">
                    INR {item.value}
                  </Text>
                </View>
              </View>
              <Text className="text-sm text-calendar-text-secondary">
                {item.date}
              </Text>
              {(item.city || item.region) && (
                <Text className="mt-1 text-xs text-calendar-text-muted">
                  {[item.city, item.region].filter(Boolean).join(", ")}
                </Text>
              )}
              {item.comment ? (
                <Text
                  className="mt-1 text-xs text-calendar-text-secondary"
                  numberOfLines={2}
                >
                  {item.comment}
                </Text>
              ) : null}
            </Pressable>
          )}
          ListEmptyComponent={
            <Text className="mt-8 text-center text-sm text-calendar-text-secondary">
              {HY.noLabs}
            </Text>
          }
          ListFooterComponent={
            <View className="mb-6 mt-2 items-center gap-3">
              {isFetching ? <ActivityIndicator color="#5d4081" /> : null}
              {meta && meta.page < meta.pageCount ? (
                <Pressable
                  onPress={() => setPage((p) => p + 1)}
                  className="rounded-lg bg-brand-100 px-4 py-2"
                >
                  <Text className="text-sm font-medium text-brand-700">
                    {HY.loadMore}
                  </Text>
                </Pressable>
              ) : null}
            </View>
          }
          showsVerticalScrollIndicator={false}
        />
      )}
    </AuthenticatedScreen>
  );
}
