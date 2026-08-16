import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientDashboard } from "@/components/patient/PatientDashboard";
import { ChatIcon } from "@/components/svg-components/chat-icon";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { HY } from "@/constants/hy";
import { useGetPatientAllInr } from "@/hooks/inr-norm/useGetPatientAllInr.hook";
import { useGetPatientInrNorm } from "@/hooks/inr-norm/useGetPatientInrNorm.hook";
import { usePatientById } from "@/hooks/patient/useGetPatientById.hook";
import { calendarApi } from "@/services/calendar.api";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

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
  const [dailyDose, setDailyDose] = useState(0);
  const [nextTestLabel, setNextTestLabel] = useState<string>(HY.notScheduled);

  const inrItems = useMemo(() => allInr?.items ?? [], [allInr]);

  const currentInr = useMemo(() => {
    if (!inrItems.length) return 0;
    return (
      [...inrItems].sort(
        (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
      )[0]?.value ?? 0
    );
  }, [inrItems]);

  useEffect(() => {
    if (!patientId) return;
    const today = dayjs().format("YYYY-MM-DD");
    void calendarApi.getRecord(today, patientId).then((record) => {
      setDailyDose(record?.warfarinDoseMg ?? 0);
      setNextTestLabel(record?.nextTestDate || HY.notScheduled);
    });
  }, [patientId]);

  if (isLoading || normLoading || inrLoading) {
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
            ttr={0}
            dailyDose={dailyDose}
            nextTestLabel={nextTestLabel}
            onBack={() => router.back()}
          />
        </ScrollView>
        <Pressable
          onPress={() => Alert.alert(HY.brand, HY.comingSoon)}
          className="absolute bottom-5 right-5 h-14 w-14 items-center justify-center rounded-full bg-calendar-primary shadow-lg active:opacity-90"
          accessibilityRole="button"
        >
          <ChatIcon />
        </Pressable>
      </View>
    </AuthenticatedScreen>
  );
}
