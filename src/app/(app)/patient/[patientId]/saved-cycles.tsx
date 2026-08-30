import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import { PermissionGate } from "@/components/permission/PermissionGate";
import { SavedCycleCard } from "@/components/saved-cycles/SavedCycleCard";
import { HeartBtnIcon } from "@/components/svg-components/heart-btn-icon";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { ApiPaths } from "@/constants/apiPaths";
import { HY } from "@/constants/hy";
import { INRAppRoutes } from "@/constants/routes.constants";
import { shiftCycleDaysToStart } from "@/helpers/calendarItems";
import { setCycleDraft } from "@/helpers/cycleDraft";
import { useDeleteInrCycle } from "@/hooks/calendar/useDeleteCycle";
import { useGetInrCircle } from "@/hooks/calendar/useGetInrCircle.hook";
import { useCan } from "@/hooks/usePermission.hook";
import type { InrCycleData } from "@/types/calendar-types";
import dayjs from "dayjs";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import { ScrollView, Text } from "react-native";

type InrCycle = InrCycleData["cycles"][number];

export default function SavedCyclesScreen() {
  const router = useRouter();
  const { patientId, doctorId } = useLocalSearchParams<{
    patientId: string;
    doctorId: string;
    from?: string;
  }>();
  const [pendingDelete, setPendingDelete] = useState<InrCycle | null>(null);

  const { inrCircle, isLoadingInrCircle, refetch } = useGetInrCircle({
    doctor_id: doctorId ?? "",
  });
  const { mutate: deleteInrCycle, isPending: isDeletingInrCycle } =
    useDeleteInrCycle(() => {
      setPendingDelete(null);
    });
  const canApply = useCan(
    "POST",
    ApiPaths.patientWarfarinCalendar(patientId ?? "{patientId}"),
  );
  const canEditCycle = useCan(
    "POST",
    ApiPaths.patientInrCycle(patientId ?? "{patientId}"),
  );
  const canDeleteCycle = useCan(
    "DELETE",
    ApiPaths.patientDeleteInrCycle(
      doctorId ?? "{doctorId}",
      pendingDelete?.id ?? "{cycleId}",
    ),
  );

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const cycles = inrCircle.cycles;

  const openCycleOnCalendar = (cycle: InrCycle, action: "apply" | "edit") => {
    if (!patientId) return;
    const today = dayjs().format("YYYY-MM-DD");
    const days =
      action === "apply"
        ? shiftCycleDaysToStart(cycle.days, today)
        : cycle.days.map((day) => ({
            id: day.id,
            date: day.date,
            dosage: day.dosage,
          }));
    setCycleDraft({
      action,
      days,
      ...(action === "edit" ? { name: cycle.name, cycleId: cycle.id } : {}),
    });
    if (router.canGoBack()) {
      router.back();
      return;
    }
    router.replace(INRAppRoutes.patientCalendar(patientId));
  };

  if (isLoadingInrCircle) return <LoadingScreen />;

  return (
    <PermissionGate method="GET" path={ApiPaths.inrCycle}>
      <AuthenticatedScreen contentClassName="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-8 pt-3"
        >
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
              <SavedCycleCard
                key={`${cycle.id ?? cycle.name}`}
                cycle={cycle}
                canApply={canApply}
                canEditCycle={canEditCycle}
                canDeleteCycle={canDeleteCycle}
                onApply={(item) => openCycleOnCalendar(item, "apply")}
                onEdit={(item) => openCycleOnCalendar(item, "edit")}
                onDelete={(cycle) => setPendingDelete(cycle)}
              />
            ))
          )}
        </ScrollView>

        <ConfirmModal
          visible={Boolean(pendingDelete)}
          title={HY.deleteCycle}
          description={HY.deleteCycleConfirm}
          subInfo={HY.deleteCycleHint}
          confirmLabel={HY.delete}
          destructive
          onCancel={() => setPendingDelete(null)}
          onConfirm={() => {
            deleteInrCycle({
              doctorId: doctorId ?? "",
              cycleId: pendingDelete?.id ?? "",
            });
          }}
          loading={isDeletingInrCycle}
        />
      </AuthenticatedScreen>
    </PermissionGate>
  );
}
