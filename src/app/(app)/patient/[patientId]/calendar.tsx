import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { HY } from "@/constants/hy";
import { calendarApi } from "@/services/calendar.api";
import type { InrRecord } from "@/types/calendar.types";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

export default function PatientCalendarScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const [month, setMonth] = useState(dayjs().startOf("month"));
  const [selected, setSelected] = useState(dayjs().format("YYYY-MM-DD"));
  const [records, setRecords] = useState<InrRecord[]>([]);
  const [dose, setDose] = useState("0.75");
  const [nextTest, setNextTest] = useState("");
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    if (!patientId) return;
    const from = month.startOf("month").format("YYYY-MM-DD");
    const to = month.endOf("month").format("YYYY-MM-DD");
    const items = await calendarApi.getRecords(from, to, patientId);
    setRecords(items);
  }, [month, patientId]);

  useEffect(() => {
    void load();
  }, [load]);

  useEffect(() => {
    const current = records.find((r) => r.date === selected);
    setDose(String(current?.warfarinDoseMg ?? 0.75));
    setNextTest(current?.nextTestDate ?? "");
  }, [records, selected]);

  const days = useMemo(() => {
    const start = month.startOf("month").startOf("week").add(1, "day"); // Monday-ish
    // dayjs week starts Sunday by default; build 42 cells from month start weekday
    const first = month.startOf("month");
    const offset = (first.day() + 6) % 7; // Monday=0
    const gridStart = first.subtract(offset, "day");
    return Array.from({ length: 42 }, (_, i) => gridStart.add(i, "day"));
  }, [month]);

  const recordByDate = useMemo(() => {
    const map = new Map<string, InrRecord>();
    records.forEach((r) => map.set(r.date, r));
    return map;
  }, [records]);

  const onSave = async () => {
    if (!patientId) return;
    const amount = Number(dose);
    if (Number.isNaN(amount) || amount < 0) {
      Alert.alert(HY.brand, HY.doseMg);
      return;
    }
    setSaving(true);
    try {
      await calendarApi.upsertRecord({
        date: selected,
        warfarinDoseMg: amount,
        nextTestDate: nextTest || undefined,
        patientId,
      });
      await load();
      Alert.alert(HY.saved, HY.dosage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <AuthenticatedScreen contentClassName="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10 pt-3"
        keyboardShouldPersistTaps="handled"
      >
        <PatientSubHeader title={HY.calendar} onBack={() => router.back()} />
        <Text className="mb-3 text-xs text-calendar-text-secondary">
          {HY.calendarLocalNote}
        </Text>

        <View className="mb-3 flex-row items-center justify-between">
          <Pressable onPress={() => setMonth((m) => m.subtract(1, "month"))}>
            <Text className="font-bold text-lg text-calendar-primary">‹</Text>
          </Pressable>
          <Text className="font-bold text-base text-grey-900">
            {month.format("MMMM YYYY")}
          </Text>
          <Pressable onPress={() => setMonth((m) => m.add(1, "month"))}>
            <Text className="font-bold text-lg text-calendar-primary">›</Text>
          </Pressable>
        </View>

        <View className="mb-2 flex-row">
          {["Երկ", "Երք", "Չրք", "Հնգ", "Ուր", "Շբթ", "Կիր"].map((d) => (
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
          <TextField
            label={HY.doseMg}
            value={dose}
            onChangeText={setDose}
            keyboardType="decimal-pad"
          />
          <TextField
            label={HY.nextTest}
            value={nextTest}
            onChangeText={setNextTest}
            placeholder="YYYY-MM-DD"
          />
          <Button title={HY.save} onPress={onSave} loading={saving} />
        </View>
      </ScrollView>
    </AuthenticatedScreen>
  );
}
