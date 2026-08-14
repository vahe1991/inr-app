import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { HY } from "@/constants/hy";
import { usePatientAllInr } from "@/hooks/usePatientInr";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { ScrollView, Text, View } from "react-native";

export default function PatientInrHistoryScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { items, isLoading } = usePatientAllInr(patientId);

  if (isLoading) return <LoadingScreen />;

  const sorted = [...items].sort(
    (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
  );

  return (
    <AuthenticatedScreen contentClassName="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10 pt-3"
        showsVerticalScrollIndicator={false}
      >
        <PatientSubHeader
          title={HY.inrHistory}
          onBack={() => router.back()}
        />
        {sorted.length === 0 ? (
          <Text className="text-sm text-calendar-text-secondary">
            {HY.noInrResults}
          </Text>
        ) : (
          sorted.map((item) => (
            <View
              key={item.id}
              className="mb-2 flex-row items-center justify-between rounded-[14px] bg-brand-50 px-3 py-3"
            >
              <View className="mr-3 flex-1">
                <Text className="font-medium text-sm text-grey-900">
                  {dayjs(item.date).format("DD.MM.YYYY")}
                </Text>
                {item.comment ? (
                  <Text
                    className="text-xs text-calendar-text-muted"
                    numberOfLines={1}
                  >
                    {item.comment}
                  </Text>
                ) : null}
              </View>
              <Text className="font-bold text-base text-calendar-primary">
                {item.value}
              </Text>
            </View>
          ))
        )}
      </ScrollView>
    </AuthenticatedScreen>
  );
}
