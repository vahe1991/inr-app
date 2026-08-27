import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import { PermissionGate } from "@/components/permission/PermissionGate";
import { CalendarBtnIcon } from "@/components/svg-components/calendar-icon";
import { Button } from "@/components/ui/Button";
import { FormDateField } from "@/components/ui/FormDateField";
import { FormTextField } from "@/components/ui/FormTextField";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { HY } from "@/constants/hy";
import { ApiPaths } from "@/constants/apiPaths";
import { useGetInrWarfarinCalendarDosage } from "@/hooks/calendar/useGetInrWarfarinCalendarDosage.hook";
import { useMutateInrWarfarinDosage } from "@/hooks/calendar/useMutateInrWarfarinDosage.hook";
import { useGetPatientAllInr } from "@/hooks/inr-norm/useGetPatientAllInr.hook";
import { usePatientById } from "@/hooks/patient/useGetPatientById.hook";
import { useCan } from "@/hooks/usePermission.hook";
import type { InrWarfarinCalendarItem } from "@/types/calendar-types";
import dayjs from "dayjs";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type KeyboardEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

function asCalendarItems(payload: unknown): InrWarfarinCalendarItem[] {
  if (Array.isArray(payload)) return payload;
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { items?: unknown }).items)
  ) {
    return (payload as { items: InrWarfarinCalendarItem[] }).items;
  }
  return [];
}

type CalendarDoseForm = {
  inrResult: string;
  dose: string;
  nextTest: string;
};

export default function PatientDailyNotesCalendarScreen() {
  const router = useRouter();
  const { patientId, mode: modeParam } = useLocalSearchParams<{
    patientId: string;
    mode?: string | string[];
  }>();
  const mode = Array.isArray(modeParam) ? modeParam[0] : modeParam;
  const insets = useSafeAreaInsets();
  const [month, setMonth] = useState(dayjs().startOf("month"));
  const [selected, setSelected] = useState(dayjs().format("YYYY-MM-DD"));
  const [successOpen, setSuccessOpen] = useState(false);
  const [keyboardHeight, setKeyboardHeight] = useState(0);

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

  const { control, handleSubmit, reset } = useForm<CalendarDoseForm>({
    defaultValues: { inrResult: "", dose: "0.75", nextTest: "" },
  });

  const { mutate: mutateInrWarfarinDosage, isPending } =
    useMutateInrWarfarinDosage(() => {
      void refetch();
      setSuccessOpen(true);
    });
  const canSave = useCan("POST", ApiPaths.inrResultDosageNextDate);

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (event: KeyboardEvent) => {
      setKeyboardHeight(
        Math.max(event.endCoordinates.height - insets.bottom, 0),
      );
    };
    const onHide = () => setKeyboardHeight(0);

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [insets.bottom]);

  const latestInr = useMemo(() => {
    const items = allInr?.items ?? [];
    if (!items.length) return "";
    return String(
      [...items].sort(
        (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
      )[0]?.value ?? "",
    );
  }, [allInr?.items]);

  const calendarItems = useMemo(
    () => asCalendarItems(calendarDosages),
    [calendarDosages],
  );

  const recordByDate = useMemo(() => {
    const map = new Map<string, InrWarfarinCalendarItem>();
    calendarItems.forEach((item) =>
      map.set(dayjs(item.date).format("YYYY-MM-DD"), item),
    );
    return map;
  }, [calendarItems]);

  const editing = recordByDate.get(selected);

  useEffect(() => {
    reset({
      inrResult: latestInr,
      dose: String(editing?.dosage ?? 0.75),
      nextTest: "",
    });
  }, [editing, latestInr, reset]);

  const days = useMemo(() => {
    const first = month.startOf("month");
    const offset = (first.day() + 6) % 7;
    const gridStart = first.subtract(offset, "day");
    return Array.from({ length: 42 }, (_, i) => gridStart.add(i, "day"));
  }, [month]);

  const onSave = ({ inrResult, dose, nextTest }: CalendarDoseForm) => {
    if (!patientId) {
      Alert.alert(HY.error, HY.patientNotFound);
      return;
    }

    if (!patient?.doctorId) {
      Alert.alert(HY.error, HY.patientNotFound);
      return;
    }

    if (!selected) {
      Alert.alert(HY.error, HY.requiredDate);
      return;
    }

    mutateInrWarfarinDosage({
      id: editing?.id || undefined,
      patient_id: patientId,
      // doctor_id: patient.doctorId,
      doctor_id: 3,
      date: selected,
      inr_result: inrResult,
      warfarine_dosage: dose,
      next_test_give_date: nextTest,
    });
  };

  return (
    <PermissionGate
      method="GET"
      path={ApiPaths.patientWarfarinCalendar(patientId ?? "{patientId}")}
    >
    <AuthenticatedScreen contentClassName="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View className="flex-1 px-4 pt-3">
          <PatientSubHeader
            title={
              mode === "test"
                ? HY.nextTest
                : mode === "dose"
                  ? HY.dailyDose
                  : HY.calendar
            }
            description={
              mode === "test"
                ? HY.nextTestHint
                : mode === "dose"
                  ? HY.dailyDoseHint
                  : HY.dosageCalendar
            }
            icon={<CalendarBtnIcon />}
            onBack={() => router.back()}
          />

          <ScrollView
            className="flex-1"
            contentContainerClassName="pb-10"
            contentContainerStyle={{
              paddingBottom:
                40 + (Platform.OS === "android" ? keyboardHeight : 0),
            }}
            keyboardShouldPersistTaps="handled"
            automaticallyAdjustKeyboardInsets
            showsVerticalScrollIndicator={false}
          >
            <View className="mb-3 flex-row items-center justify-between">
              <Pressable
                onPress={() => setMonth((m) => m.subtract(1, "month"))}
              >
                <Text className="font-bold text-lg text-calendar-primary">
                  ‹
                </Text>
              </Pressable>
              <Text className="font-bold text-base text-grey-900">
                {month.format("MMMM YYYY")}
              </Text>
              <Pressable onPress={() => setMonth((m) => m.add(1, "month"))}>
                <Text className="font-bold text-lg text-calendar-primary">
                  ›
                </Text>
              </Pressable>
            </View>

            <View className="mb-2 flex-row">
              {HY.weekdaysShort.map((d) => (
                <Text
                  key={d}
                  className="flex-1 text-center text-[11px] text-calendar-text-muted"
                >
                  {d}
                </Text>
              ))}
            </View>

            <View className="mb-4 flex-row flex-wrap rounded-[16px] bg-brand-50 p-2">
              {days.map((day) => {
                const key = day.format("YYYY-MM-DD");
                const inMonth = day.month() === month.month();
                const active = key === selected;
                const hasRecord = recordByDate.has(key);
                return (
                  <Pressable
                    key={key}
                    onPress={() => setSelected(key)}
                    style={{ width: "14.28%" }}
                    className={`mb-1 h-11 items-center justify-center rounded-lg ${
                      active ? "bg-calendar-primary" : ""
                    }`}
                  >
                    <Text
                      className={`font-semibold text-sm ${
                        active
                          ? "text-white"
                          : inMonth
                            ? "text-grey-900"
                            : "text-calendar-text-muted"
                      }`}
                    >
                      {day.date()}
                    </Text>
                    {hasRecord ? (
                      <View
                        className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                          active ? "bg-white" : "bg-calendar-primary"
                        }`}
                      />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>

            <View className="rounded-[16px] border border-brand-100 bg-white p-3">
              <Text className="mb-2 font-semibold text-sm text-grey-900">
                {dayjs(selected).format("DD.MM.YYYY")}
              </Text>
              <FormTextField
                control={control}
                name="inrResult"
                editable={canSave}
                rules={{
                  validate: (raw) => {
                    const value = String(raw ?? "").trim();
                    if (!value) return true;
                    const num = Number(value);
                    return (
                      (!Number.isNaN(num) && num > 0) || HY.invalidInr
                    );
                  },
                }}
                label={HY.enterInrValue}
                keyboardType="decimal-pad"
              />
              <FormTextField
                control={control}
                name="dose"
                editable={canSave}
                rules={{
                  required: mode === "dose" ? HY.requiredField : false,
                  validate: (raw) => {
                    const value = String(raw ?? "").trim();
                    if (!value) return mode === "dose" ? HY.requiredField : true;
                    return (
                      (!Number.isNaN(Number(value)) && Number(value) >= 0) ||
                      HY.invalidDose
                    );
                  },
                }}
                label={HY.doseMg}
                keyboardType="decimal-pad"
              />
              <FormDateField
                control={control}
                name="nextTest"
                disabled={!canSave}
                rules={{
                  required: mode === "test" ? HY.requiredDate : false,
                  validate: (raw) => {
                    if (!raw) return mode === "test" ? HY.requiredDate : true;
                    return (
                      !dayjs(raw).isBefore(dayjs(), "day") ||
                      HY.dateNotBeforeToday
                    );
                  },
                }}
                minimumDate={dayjs().startOf("day").toDate()}
                valueFormat="YYYY-MM-DD"
                label={HY.nextTest}
                displayFormat="DD.MM.YYYY"
                placeholder={HY.notScheduled}
              />
              {canSave ? (
                <Button
                  title={HY.save}
                  onPress={handleSubmit(onSave)}
                  loading={isPending}
                />
              ) : null}
            </View>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={successOpen}
        title={HY.saved}
        description={HY.dosage}
        onClose={() => {
          setSuccessOpen(false);
          router.back();
        }}
      />
    </AuthenticatedScreen>
    </PermissionGate>
  );
}
