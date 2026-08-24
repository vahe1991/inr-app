import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientDashboard } from "@/components/patient/PatientDashboard";
import { ChatIcon } from "@/components/svg-components/chat-icon";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { HY } from "@/constants/hy";
import { INRAppRoutes } from "@/constants/routes.constants";
import { asCalendarItems } from "@/helpers/calendarItems";
import { useGetInrWarfarinCalendarDosage } from "@/hooks/calendar/useGetInrWarfarinCalendarDosage.hook";
import { useGetPatientAllInr } from "@/hooks/inr-norm/useGetPatientAllInr.hook";
import { useGetPatientInrNorm } from "@/hooks/inr-norm/useGetPatientInrNorm.hook";
import { usePatientById } from "@/hooks/patient/useGetPatientById.hook";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useMemo } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function PatientScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { patient, isLoading } = usePatientById(patientId);
  const { inrNorm, isLoading: normLoading } = useGetPatientInrNorm({
    patient_id: patientId ?? "",
    date: dayjs().format("YYYY-MM-DD"),
  });
  const { allInr, isLoading: inrLoading } = useGetPatientAllInr({
    patient_id: patientId ?? "",
    page: "1",
    pageSize: "50",
  });
  const { calendarDosages, isLoadingCalendarDosage } =
    useGetInrWarfarinCalendarDosage({
      patient_id: patientId ?? "",
      page: 1,
      pageSize: 100,
    });

  const inrItems = useMemo(() => allInr?.items ?? [], [allInr]);

  const currentInr = useMemo(() => {
    if (!inrItems.length) return 0;
    return (
      [...inrItems].sort(
        (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
      )[0]?.value ?? 0
    );
  }, [inrItems]);

  const calendarItems = useMemo(
    () => asCalendarItems(calendarDosages),
    [calendarDosages],
  );

  const latestDosage = useMemo(() => {
    if (!calendarItems.length) return undefined;
    const today = dayjs().format("YYYY-MM-DD");
    return (
      calendarItems.find(
        (item) => dayjs(item.date).format("YYYY-MM-DD") === today,
      ) ??
      [...calendarItems].sort(
        (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
      )[0]
    );
  }, [calendarItems]);

  if (isLoading || normLoading || inrLoading || isLoadingCalendarDosage) {
    return <LoadingScreen />;
  }

  if (!patient || !patientId) {
    return (
      <AuthenticatedScreen>
        <View className="flex-1 items-center justify-center px-4">
          <Text className="mb-4 text-sm text-calendar-danger">
            Պացիենտը չի գտնվել
          </Text>
          <Button title="Վերադառնալ" onPress={() => router.back()} />
        </View>
      </AuthenticatedScreen>
    );
  }

  return (
    <AuthenticatedScreen contentClassName="flex-1">
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          showsVerticalScrollIndicator={false}
          contentContainerClassName="pb-24"
        >
          <PatientDashboard
            patient={patient}
            patientId={patientId}
            normStart={inrNorm?.normStart}
            normEnd={inrNorm?.normEnd}
            currentInr={currentInr}
            dailyDose={latestDosage?.dosage ?? 0}
            nextTestLabel={HY.notScheduled}
            onBack={() => router.back()}
          />
        </ScrollView>
        <Pressable
          onPress={() =>
            router.push(INRAppRoutes.patientChat(patientId, patient.fullName))
          }
          className="absolute bottom-5 right-5 h-14 w-14 items-center justify-center rounded-full bg-calendar-primary shadow-lg active:opacity-90"
          accessibilityRole="button"
        >
          <ChatIcon />
        </Pressable>
      </View>
    </AuthenticatedScreen>
  );
}
