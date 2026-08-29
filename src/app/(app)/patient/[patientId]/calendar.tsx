import { CreateCycleModal } from "@/components/calendar/CreateCycleModal";
import { DayDoseModal } from "@/components/calendar/DayDoseModal";
import type { DayMark } from "@/components/calendar/MonthCalendarGrid";
import { MonthCalendarGrid } from "@/components/calendar/MonthCalendarGrid";
import { MonthPickerSheet } from "@/components/calendar/MonthPickerSheet";
import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import { Permission } from "@/components/permission/Permission";
import { PermissionGate } from "@/components/permission/PermissionGate";
import { HeartBtnIcon } from "@/components/svg-components/heart-btn-icon";
import { Button } from "@/components/ui/Button";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { ApiPaths } from "@/constants/apiPaths";
import { HY } from "@/constants/hy";
import { INRAppRoutes } from "@/constants/routes.constants";
import { asCalendarItems, type SavedCycleDay } from "@/helpers/calendarItems";
import {
  clearCycleDraft,
  peekCycleDraft,
  type CycleDraft,
} from "@/helpers/cycleDraft";
import { useDeleteWarfarinCalendarDosage } from "@/hooks/calendar/useDeleteWarfarinCalendarDosage.hook";
import { useGetInrWarfarinCalendarDosage } from "@/hooks/calendar/useGetInrWarfarinCalendarDosage.hook";
import { useMutateInrWarfarinDosage as useMutateInrCycle } from "@/hooks/calendar/useMutateInrCyrcle.hook";
import { useMutateInrWarfarinDosage } from "@/hooks/calendar/useMutateInrWarfarinDosage.hook";
import { useMutateWarfarinCalendar } from "@/hooks/calendar/useMutateWarfarinCalendar.hook";
import { useGetPatientAllInr } from "@/hooks/inr-norm/useGetPatientAllInr.hook";
import { usePatientById } from "@/hooks/patient/useGetPatientById.hook";
import { useCan } from "@/hooks/usePermission.hook";
import dayjs from "dayjs";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Alert, ScrollView, Text, View } from "react-native";

type CalendarMode = "dose" | "test" | "calendar";

export default function PatientCalendarScreen() {
  const router = useRouter();
  const {
    patientId,
    mode: modeParam,
    date: dateParam,
  } = useLocalSearchParams<{
    patientId: string;
    mode?: CalendarMode | CalendarMode[];
    date?: string | string[];
  }>();
  const rawMode = Array.isArray(modeParam) ? modeParam[0] : modeParam;
  const mode: CalendarMode =
    rawMode === "test" || rawMode === "dose" ? rawMode : "calendar";
  const initialDate =
    (Array.isArray(dateParam) ? dateParam[0] : dateParam) ||
    dayjs().format("YYYY-MM-DD");

  const [month, setMonth] = useState(dayjs(initialDate).startOf("month"));
  const [selected, setSelected] = useState(initialDate);
  const [dayOpen, setDayOpen] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const [createOpen, setCreateOpen] = useState(false);
  const [dose, setDose] = useState(2);
  const [isNextTest, setIsNextTest] = useState(false);
  const [nextTestDate, setNextTestDate] = useState<string | null>(null);
  const [appliedDays, setAppliedDays] = useState<SavedCycleDay[]>([]);
  const [success, setSuccess] = useState<{
    title: string;
    description?: string;
    goToSaved?: boolean;
  } | null>(null);
  const [cycleDraft, setCycleDraft] = useState<CycleDraft | null>(null);

  const { patient } = usePatientById(patientId);
  const { calendarDosages, refetch } = useGetInrWarfarinCalendarDosage({
    patient_id: patientId ?? "",
    page: 1,
    pageSize: 100,
  });
  const { allInr } = useGetPatientAllInr({
    patient_id: patientId ?? "",
    page: "1",
    pageSize: "50",
  });

  const { mutateAsync: mutateCalendar, isPending: savingCalendar } =
    useMutateWarfarinCalendar();
  const { mutateAsync: mutateDosage, isPending: savingDosage } =
    useMutateInrWarfarinDosage();
  const { mutateAsync: mutateCycle, isPending: savingCycle } =
    useMutateInrCycle();
  const { mutateAsync: deleteDosage, isPending: deleting } =
    useDeleteWarfarinCalendarDosage();
  const canSaveDose = useCan(
    "POST",
    ApiPaths.patientWarfarinCalendar(patientId ?? "{patientId}"),
  );
  const canSaveNextTest = useCan("POST", ApiPaths.inrResultDosageNextDate);

  useFocusEffect(
    useCallback(() => {
      void refetch();
      const draft = peekCycleDraft();
      if (!draft?.days.length) return;
      setCycleDraft(draft);
      setCreateOpen(true);
      const first = draft.days[0]?.date;
      if (first) {
        setMonth(dayjs(first).startOf("month"));
        setSelected(first);
      }
    }, [refetch]),
  );

  const latestInr = useMemo(() => {
    const items = allInr?.items ?? [];
    if (!items.length) return 0;
    return (
      [...items].sort(
        (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
      )[0]?.value ?? 0
    );
  }, [allInr?.items]);

  const calendarItems = useMemo(
    () => asCalendarItems(calendarDosages),
    [calendarDosages],
  );

  const recordByDate = useMemo(() => {
    const map = new Map(
      calendarItems.map((item) => [
        dayjs(item.date).format("YYYY-MM-DD"),
        item,
      ]),
    );
    return map;
  }, [calendarItems]);

  const nextTestDates = useMemo(() => {
    const dates = new Set<string>();
    (calendarDosages?.nextTestGiveDates ?? []).forEach((item) => {
      const raw = item.date || item.visitDate;
      if (!raw) return;
      dates.add(dayjs(raw).format("YYYY-MM-DD"));
    });
    if (nextTestDate) dates.add(nextTestDate);
    return dates;
  }, [calendarDosages?.nextTestGiveDates, nextTestDate]);

  const marks = useMemo(() => {
    const next: Record<string, DayMark> = {};
    calendarItems.forEach((item) => {
      const key = dayjs(item.date).format("YYYY-MM-DD");
      next[key] = { ...next[key], dosage: item.dosage, dot: "purple" };
    });
    appliedDays.forEach((item, index, list) => {
      next[item.date] = {
        dosage: item.dosage,
        inRange: true,
        rangeEdge: index === 0 || index === list.length - 1,
      };
    });
    nextTestDates.forEach((key) => {
      next[key] = { ...next[key], dot: "red" };
    });
    return next;
  }, [appliedDays, calendarItems, nextTestDates]);

  const title =
    mode === "test"
      ? HY.nextTest
      : mode === "dose"
        ? HY.dailyDose
        : HY.prescribeDosage;
  const description =
    mode === "test" ? HY.nextTestHint : HY.prescribeDosageHint;
  const markedDates = useMemo(
    () => calendarItems.map((item) => dayjs(item.date).format("YYYY-MM-DD")),
    [calendarItems],
  );
  const isActiveCycle = appliedDays.length > 0;

  const openDay = (date: string) => {
    setSelected(date);
    const existing = recordByDate.get(date);
    setDose(
      existing?.dosage ??
        appliedDays.find((item) => item.date === date)?.dosage ??
        2,
    );
    setIsNextTest(mode === "test" || nextTestDates.has(date));
    setDayOpen(true);
  };

  const saveDay = async () => {
    if (!patientId) {
      Alert.alert(HY.error, HY.patientNotFound);
      return;
    }

    const existing = recordByDate.get(selected);
    let calendarSaved = false;
    try {
      if (dose > 0 && canSaveDose) {
        await mutateCalendar({
          patientId,
          ...(existing ? { id: existing.id } : {}),
          date: selected,
          dosage: dose,
        });
        calendarSaved = true;
      }

      if (isNextTest && patient?.doctorId && canSaveNextTest) {
        await mutateDosage({
          id: existing?.id ?? 0,
          patient_id: patientId,
          doctor_id: String(patient.doctorId),
          date: selected,
          inr_result: Number(latestInr) || 0,
          warfarine_dosage: dose,
          next_test_give_date: selected,
        });
        setNextTestDate(selected);
      }

      setDayOpen(false);
      await refetch();
      if (calendarSaved) {
        setSuccess({ title: HY.saved, description: HY.dosage });
      }
    } catch {
      /* hook alerts */
    }
  };

  const applyDays = async (days: SavedCycleDay[]) => {
    if (!patientId) return;
    try {
      for (const day of days) {
        const existing = recordByDate.get(day.date);
        await mutateCalendar({
          patientId,
          ...(existing ? { id: existing.id } : {}),
          date: day.date,
          dosage: day.dosage,
        });
      }
      setAppliedDays(days);
      setCreateOpen(false);
      setCycleDraft(null);
      clearCycleDraft();
      await refetch();
      setSuccess({
        title: HY.cycle,
        description: HY.appliedCycleSuccess,
      });
    } catch {
      /* hook alerts */
    }
  };

  const saveNamedCycle = async (name: string, days: SavedCycleDay[]) => {
    if (!patientId || !patient) {
      Alert.alert(HY.error, HY.patientNotFound);
      return;
    }
    try {
      await mutateCycle({
        ...(cycleDraft?.cycleId ? { id: cycleDraft.cycleId } : {}),
        doctor_id: patient?.doctorId,
        patient_id: patientId,
        ...(name ? { name } : {}),
        days: days.map((day) => ({
          date: day.date,
          dosage: day.dosage,
          ...(day.id ? { id: day.id } : {}),
        })),
      });
      setAppliedDays(days);
      setCreateOpen(false);
      setCycleDraft(null);
      clearCycleDraft();
      await refetch();
      setSuccess({
        title: name || HY.cycle,
        description: HY.updatedCycleSuccess,
        goToSaved: Boolean(name),
      });
    } catch {
      /* hook alerts */
    }
  };

  const closeSuccess = () => {
    const goToSaved = success?.goToSaved;
    setSuccess(null);
    if (goToSaved && patientId) {
      router.push(
        INRAppRoutes.patientSavedCycles(patientId, selected, patient?.doctorId),
      );
    }
  };

  const removeApplied = async () => {
    if (!patientId) return;
    try {
      for (const day of appliedDays) {
        const existing = recordByDate.get(day.date);
        if (!existing) continue;
        await deleteDosage({
          patient_id: patientId,
          calendarId: existing.id,
        });
      }
      setAppliedDays([]);

      await refetch();
    } catch {
      /* hook alerts */
    }
  };

  const cycleRangeLabel = appliedDays.length
    ? `${dayjs(appliedDays[0].date).format("DD")} - ${dayjs(
        appliedDays[appliedDays.length - 1].date,
      ).format("DD")} ${HY.months[dayjs(appliedDays[0].date).month()]}, ${dayjs(
        appliedDays[0].date,
      ).year()} (${appliedDays.length} ${HY.daysUnit})`
    : "";

  return (
    <PermissionGate
      method="GET"
      path={ApiPaths.patientWarfarinCalendar(patientId ?? "{patientId}")}
    >
      <AuthenticatedScreen contentClassName="flex-1">
        <View className="flex-1 px-4 pt-3">
          <PatientSubHeader
            title={isActiveCycle ? HY.activeDosageCycle : title}
            description={
              isActiveCycle
                ? `${HY.cycleApplied} ${cycleRangeLabel}`
                : description
            }
            icon={<HeartBtnIcon />}
            onBack={() => router.back()}
          />

          <View className="flex-1">
            <ScrollView
              className="flex-1"
              contentContainerClassName="pb-6"
              keyboardShouldPersistTaps="handled"
            >
              <Text className="mb-3 text-[13px] text-grey-900">
                {HY.selectDateForDoseOrTest}
              </Text>

              <MonthCalendarGrid
                month={month}
                selected={selected}
                marks={marks}
                onPrev={() => setMonth((value) => value.subtract(1, "month"))}
                onNext={() => setMonth((value) => value.add(1, "month"))}
                onPressTitle={() => setMonthPickerOpen(true)}
                onSelectDay={openDay}
              />

              {nextTestDates.size ? (
                <View className="mt-3 flex-row items-center justify-center gap-2">
                  <View className="h-[7px] w-[7px] rounded-full bg-red-700" />
                  <Text className="text-[12px] font-[600] text-brand-600">
                    {HY.inrTestDay}
                  </Text>
                </View>
              ) : null}
            </ScrollView>

            <View className="gap-2 pb-3 pt-2">
              <Text className="text-center text-[13px] text-grey-900">
                {HY.selectOrCreateCycle}
              </Text>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Permission method="GET" path={ApiPaths.inrCycle}>
                    <Button
                      title={HY.selectCycle}
                      onPress={() =>
                        router.push(
                          INRAppRoutes.patientSavedCycles(
                            patientId ?? "",
                            selected,
                            patient?.doctorId,
                          ),
                        )
                      }
                    />
                  </Permission>
                </View>
                <View className="flex-1">
                  <Permission
                    method="POST"
                    path={ApiPaths.patientInrCycle(patientId ?? "{patientId}")}
                  >
                    <Button
                      title={HY.createCycle}
                      variant="outline"
                      onPress={() => setCreateOpen(true)}
                    />
                  </Permission>
                </View>
              </View>
            </View>
          </View>
        </View>

        <MonthPickerSheet
          visible={monthPickerOpen}
          year={month.year()}
          month={month.month()}
          markedDates={markedDates}
          onClose={() => setMonthPickerOpen(false)}
          onSelect={(year, monthIndex) => {
            setMonth(dayjs().year(year).month(monthIndex).startOf("month"));
            setMonthPickerOpen(false);
          }}
        />

        <DayDoseModal
          visible={dayOpen}
          date={selected}
          dose={dose}
          isNextTest={isNextTest}
          loading={savingCalendar || savingDosage}
          onChangeDose={setDose}
          onToggleNextTest={() => setIsNextTest((value) => !value)}
          onSave={() => void saveDay()}
          onClose={() => setDayOpen(false)}
        />

        <CreateCycleModal
          visible={createOpen}
          month={month}
          onChangeMonth={setMonth}
          loading={savingCalendar || savingCycle}
          onClose={() => {
            const fromSavedCycles =
              cycleDraft?.action === "apply" || cycleDraft?.action === "edit";
            setCreateOpen(false);
            setCycleDraft(null);
            clearCycleDraft();
            if (fromSavedCycles && patientId) {
              router.push(
                INRAppRoutes.patientSavedCycles(
                  patientId,
                  selected,
                  patient?.doctorId,
                ),
              );
            }
          }}
          initialDays={cycleDraft?.days}
          initialName={cycleDraft?.name}
          lockName={cycleDraft?.action === "edit"}
          hideSave={cycleDraft?.action === "apply"}
          hideApply={cycleDraft?.action === "edit"}
          cancelLabel={
            cycleDraft?.action === "apply" || cycleDraft?.action === "edit"
              ? HY.returnBack
              : HY.cancel
          }
          onApply={(days) => void applyDays(days)}
          onSave={(name, days) => void saveNamedCycle(name, days)}
        />

        <SuccessModal
          visible={success !== null}
          title={success?.title ?? ""}
          description={success?.description}
          onClose={closeSuccess}
        />
      </AuthenticatedScreen>
    </PermissionGate>
  );
}
