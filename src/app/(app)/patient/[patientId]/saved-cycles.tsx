import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import { EditIcon } from "@/components/svg-components/edit-icon";
import { HeartBtnIcon } from "@/components/svg-components/heart-btn-icon";
import { TrashIcon } from "@/components/svg-components/trash-icon";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { HY } from "@/constants/hy";
import { asSavedCycles, type SavedCycle } from "@/helpers/calendarItems";
import { useGetInrCircle } from "@/hooks/calendar/useGetInrCircle.hook";
import { useMutateWarfarinCalendar } from "@/hooks/calendar/useMutateWarfarinCalendar.hook";
import { usePatientById } from "@/hooks/patient/useGetPatientById.hook";
import dayjs from "dayjs";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

export default function SavedCyclesScreen() {
  const router = useRouter();
  const { patientId, from } = useLocalSearchParams<{
    patientId: string;
    from?: string;
  }>();
  const startDate = from || dayjs().format("YYYY-MM-DD");
  const [pendingDelete, setPendingDelete] = useState<SavedCycle | null>(null);

  const { patient, isLoading: isLoadingPatient } = usePatientById(patientId);
  const { inrCircle, isLoadingInrCircle, refetch } = useGetInrCircle({
    doctor_id: String(patient?.doctorId ?? ""),
    patient_id: patientId ?? "",
  });
  const { mutateAsync, isPending } = useMutateWarfarinCalendar();

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const cycles = useMemo(() => asSavedCycles(inrCircle), [inrCircle]);

  const applyCycle = async (cycle: SavedCycle) => {
    if (!patientId) return;
    try {
      for (let index = 0; index < cycle.days.length; index += 1) {
        await mutateAsync({
          patientId,
          date: dayjs(startDate).add(index, "day").format("YYYY-MM-DD"),
          dosage: cycle.days[index].dosage,
        });
      }
      router.back();
    } catch {
      /* hook alerts */
    }
  };

  if (isLoadingPatient || isLoadingInrCircle) return <LoadingScreen />;

  return (
    <AuthenticatedScreen contentClassName="flex-1">
      <ScrollView className="flex-1" contentContainerClassName="px-4 pb-8 pt-3">
        <PatientSubHeader
          title={HY.savedCycles}
          description={HY.savedCyclesHint}
          icon={<HeartBtnIcon />}
          onBack={() => router.back()}
        />

        {!cycles.length ? (
          <Text className="mt-10 text-center text-[16px] text-grey-400">
            {HY.noSavedCycles}
          </Text>
        ) : (
          cycles.map((cycle) => (
            <Pressable
              key={`${cycle.id ?? cycle.name}`}
              onPress={() => void applyCycle(cycle)}
              disabled={isPending}
              className="mb-3 rounded-[12px] bg-brand-50 p-4 active:opacity-80"
            >
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="font-semibold text-[16px] text-calendar-primary">
                  {cycle.name}
                </Text>
                <View className="flex-row items-center gap-3">
                  <Pressable hitSlop={8}>
                    <EditIcon />
                  </Pressable>
                  <Pressable
                    onPress={() => setPendingDelete(cycle)}
                    hitSlop={8}
                  >
                    <TrashIcon />
                  </Pressable>
                </View>
              </View>
              <View className="gap-1">
                <View className="flex-row flex-wrap">
                  <Text className="text-[13px] text-brand-500">
                    {HY.duration}:{" "}
                  </Text>
                  <Text className="text-[13px] text-grey-900">
                    {cycle.days.length} {HY.daysUnit}
                  </Text>
                </View>
                <View className="flex-row flex-wrap">
                  <Text className="text-[13px] text-brand-500">
                    {HY.dosage}:{" "}
                  </Text>
                  <Text className="min-w-0 flex-1 text-[13px] text-grey-900">
                    {cycle.days
                      .map((day) => `${day.dosage} ${HY.mg}`)
                      .join(" - ")}
                  </Text>
                </View>
                {cycle.createdAt ? (
                  <View className="flex-row flex-wrap">
                    <Text className="text-[13px] text-brand-500">
                      {HY.createdOn}:{" "}
                    </Text>
                    <Text className="text-[13px] text-grey-900">
                      {dayjs(cycle.createdAt).format("DD.MM.YYYY")}
                    </Text>
                  </View>
                ) : null}
              </View>
            </Pressable>
          ))
        )}
      </ScrollView>

      <ConfirmModal
        visible={Boolean(pendingDelete)}
        title={HY.deleteCycle}
        description={`${HY.deleteCycleConfirm}\n${HY.deleteCycleHint}`}
        confirmLabel={HY.delete}
        destructive
        onCancel={() => setPendingDelete(null)}
        onConfirm={() => {
          Alert.alert(HY.comingSoon);
          setPendingDelete(null);
        }}
      />
    </AuthenticatedScreen>
  );
}
