import { MonthCalendarGrid } from "@/components/calendar/MonthCalendarGrid";
import { MonthPickerSheet } from "@/components/calendar/MonthPickerSheet";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { HY } from "@/constants/hy";
import type { SavedCycleDay } from "@/helpers/calendarItems";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  ScrollView,
  Text,
  TextInput,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const DEFAULT_DOSE = 2;
const STEP = 0.25;

function roundDose(value: number) {
  return Math.max(0, Math.round(value * 100) / 100);
}

function formatDose(value: number) {
  return String(value);
}

function CycleDoseField({
  value,
  onChange,
}: {
  value: number;
  onChange: (next: number) => void;
}) {
  const [text, setText] = useState(formatDose(value));
  const [focused, setFocused] = useState(false);

  useEffect(() => {
    if (!focused) setText(formatDose(value));
  }, [focused, value]);

  const applyText = (raw: string) => {
    const cleaned = raw.replace(",", ".").replace(/[^\d.]/g, "");
    const parts = cleaned.split(".");
    const next =
      parts.length > 2 ? `${parts[0]}.${parts.slice(1).join("")}` : cleaned;
    setText(next);
    if (next === "" || next === ".") return;
    const num = Number(next);
    if (!Number.isNaN(num)) onChange(roundDose(num));
  };

  return (
    <View className="flex-row items-center overflow-hidden rounded-[12px] border border-brand-200 bg-white">
      <Pressable
        onPress={() => onChange(roundDose(value - STEP))}
        className="h-10 w-10 items-center justify-center bg-brand-50"
        accessibilityLabel="−"
      >
        <Text className="text-[20px] text-calendar-primary">−</Text>
      </Pressable>
      <TextInput
        value={focused ? text : formatDose(value)}
        onChangeText={applyText}
        onFocus={() => {
          setFocused(true);
          setText(formatDose(value));
        }}
        onBlur={() => {
          setFocused(false);
          const num = Number(text);
          if (text === "" || text === "." || Number.isNaN(num)) {
            setText(formatDose(value));
            return;
          }
          onChange(roundDose(num));
        }}
        keyboardType="decimal-pad"
        selectTextOnFocus
        className="h-10 min-w-[52px] flex-1 px-1 text-center font-medium text-[15px] text-calendar-primary"
      />
      <Text className="pr-1 text-[12px] text-grey-400">{HY.mg}</Text>
      <Pressable
        onPress={() => onChange(roundDose(value + STEP))}
        className="h-10 w-10 items-center justify-center bg-brand-50"
        accessibilityLabel="+"
      >
        <Text className="text-[20px] text-calendar-primary">+</Text>
      </Pressable>
    </View>
  );
}

type CreateCycleModalProps = {
  visible: boolean;
  month: Dayjs;
  onChangeMonth: (month: Dayjs) => void;
  loading?: boolean;
  onClose: () => void;
  onApply: (days: SavedCycleDay[]) => void;
  onSave: (name: string, days: SavedCycleDay[]) => void;
};

function sortDays(days: SavedCycleDay[]) {
  return [...days].sort((a, b) => a.date.localeCompare(b.date));
}

function mergeDays(current: SavedCycleDay[], dates: string[]) {
  const map = new Map(current.map((day) => [day.date, day]));
  dates.forEach((date) => {
    if (!map.has(date)) map.set(date, { date, dosage: DEFAULT_DOSE });
  });
  return sortDays([...map.values()]);
}

export function CreateCycleModal({
  visible,
  month,
  onChangeMonth,
  loading,
  onClose,
  onApply,
  onSave,
}: CreateCycleModalProps) {
  const [days, setDays] = useState<SavedCycleDay[]>([]);
  const [nameOpen, setNameOpen] = useState(false);
  const [name, setName] = useState("");
  const [dragging, setDragging] = useState(false);
  const [monthPickerOpen, setMonthPickerOpen] = useState(false);
  const daysBeforeDrag = useRef<SavedCycleDay[]>([]);
  const insets = useSafeAreaInsets();

  const setDayDose = (date: string, dosage: number) => {
    setDays((current) =>
      current.map((day) => (day.date === date ? { ...day, dosage } : day)),
    );
  };

  useEffect(() => {
    if (!visible) {
      setDays([]);
      setNameOpen(false);
      setName("");
      setDragging(false);
      setMonthPickerOpen(false);
    }
  }, [visible]);

  const marks = useMemo(() => {
    const next: Record<
      string,
      { inRange?: boolean; rangeEdge?: boolean; dosage?: number }
    > = {};
    days.forEach((day, index) => {
      next[day.date] = {
        inRange: true,
        rangeEdge: index === 0 || index === days.length - 1,
        dosage: day.dosage,
      };
    });
    return next;
  }, [days]);

  const onSelectDay = (date: string) => {
    setDays((current) => {
      if (current.some((day) => day.date === date)) {
        return current.filter((day) => day.date !== date);
      }
      return mergeDays(current, [date]);
    });
  };

  const onSelectRange = (dates: string[]) => {
    setDays(mergeDays(daysBeforeDrag.current, dates));
  };

  const rangeLabel = useMemo(() => {
    if (!days.length) return "";
    const first = dayjs(days[0].date);
    const last = dayjs(days[days.length - 1].date);
    const label = `${first.date()}-${last.date()} ${HY.months[first.month()]}, ${first.year()}`;
    return days.length > 1 && last.diff(first, "day") + 1 !== days.length
      ? `${label} (${days.length} ${HY.daysUnit})`
      : label;
  }, [days]);

  return (
    <>
      <Modal
        visible={visible}
        transparent
        animationType="slide"
        statusBarTranslucent
        onRequestClose={onClose}
      >
        <View className="flex-1 justify-end">
          <Pressable
            className="absolute inset-0 bg-black/40"
            onPress={onClose}
            accessibilityLabel={HY.cancel}
          />
          <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
          >
            <View
              className="max-h-[92%] rounded-t-[24px] bg-white px-4 pt-3"
              style={{ paddingBottom: Math.max(insets.bottom, 16) }}
            >
              <View className="mb-3 items-center">
                <View className="h-1 w-12 rounded-full bg-brand-200" />
              </View>
              <View className="mb-3 flex-row items-center justify-between">
                <Text className="font-semibold text-[18px] text-calendar-primary">
                  {HY.createDosageCycle}
                </Text>
                <Pressable
                  onPress={onClose}
                  className="h-8 w-8 items-center justify-center rounded-lg bg-brand-100"
                >
                  <Text className="text-[16px] text-calendar-primary">×</Text>
                </Pressable>
              </View>

              <ScrollView
                showsVerticalScrollIndicator={false}
                scrollEnabled={!dragging}
                keyboardShouldPersistTaps="handled"
                automaticallyAdjustKeyboardInsets
                style={{ flexGrow: 0, flexShrink: 1 }}
              >
                <MonthCalendarGrid
                  month={month}
                  marks={marks}
                  onPrev={() => onChangeMonth(month.subtract(1, "month"))}
                  onNext={() => onChangeMonth(month.add(1, "month"))}
                  onPressTitle={() => setMonthPickerOpen(true)}
                  onSelectDay={onSelectDay}
                  onSelectRange={onSelectRange}
                  onDragStateChange={(isDragging) => {
                    if (isDragging) daysBeforeDrag.current = days;
                    setDragging(isDragging);
                  }}
                />

                <View className="mt-3 flex-row gap-2 rounded-[12px] bg-brand-50 p-3">
                  <Text className="text-[14px] text-calendar-primary">i</Text>
                  <Text className="min-w-0 flex-1 text-[12px] leading-5 text-grey-900">
                    {days.length ? HY.defaultDoseHint : HY.selectDateRangeHint}
                  </Text>
                </View>

                {days.length ? (
                  <View className="mt-4">
                    <Text className="mb-3 font-medium text-[14px] text-grey-900">
                      {HY.selectedRange} {rangeLabel}
                    </Text>
                    {days.map((item, index) => {
                      const parsed = dayjs(item.date);
                      return (
                        <View
                          key={item.date}
                          className="mb-2 rounded-[12px] bg-brand-50 px-3 py-3"
                        >
                          <View className="mb-2 flex-row items-start justify-between">
                            <View className="min-w-0 flex-1 pr-3">
                              <Text className="text-[14px] text-grey-900">
                                {HY.weekdaysLong[parsed.day()]},{" "}
                                {HY.months[parsed.month()]} {parsed.date()},{" "}
                                {parsed.year()}
                              </Text>
                              <Text className="text-[12px] text-grey-400">
                                {HY.dayN} {index + 1}
                              </Text>
                            </View>
                            <Pressable
                              onPress={() =>
                                setDays((current) =>
                                  current.filter(
                                    (day) => day.date !== item.date,
                                  ),
                                )
                              }
                              className="h-9 w-9 items-center justify-center rounded-lg bg-white"
                            >
                              <Text className="text-[18px] text-calendar-danger">
                                ×
                              </Text>
                            </Pressable>
                          </View>
                          <CycleDoseField
                            value={item.dosage}
                            onChange={(dosage) => setDayDose(item.date, dosage)}
                          />
                        </View>
                      );
                    })}
                    <View className="mt-2">
                      <Button
                        title={HY.saveCycle}
                        variant="outline"
                        onPress={() => setNameOpen(true)}
                      />
                    </View>
                  </View>
                ) : null}
              </ScrollView>

              <View
                className="mt-3 flex-row items-center justify-between gap-3"
                style={{ flexShrink: 0 }}
              >
                <Pressable onPress={onClose} className="px-2 py-3">
                  <Text className="font-medium text-[14px] text-calendar-primary">
                    {HY.cancel}
                  </Text>
                </Pressable>
                <View className="min-w-[160px]">
                  <Button
                    title={HY.applyDosage}
                    disabled={!days.length}
                    loading={loading}
                    onPress={() => onApply(days)}
                  />
                </View>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      <MonthPickerSheet
        visible={monthPickerOpen}
        year={month.year()}
        month={month.month()}
        markedDates={days.map((day) => day.date)}
        onClose={() => setMonthPickerOpen(false)}
        onSelect={(year, monthIndex) => {
          onChangeMonth(dayjs().year(year).month(monthIndex).startOf("month"));
          setMonthPickerOpen(false);
        }}
      />

      <Modal visible={nameOpen} transparent animationType="fade">
        <Pressable
          className="flex-1 items-center justify-center bg-black/40 px-6"
          onPress={() => setNameOpen(false)}
        >
          <Pressable className="w-full rounded-[16px] bg-white p-4">
            <Text className="mb-3 font-semibold text-[16px] text-grey-900">
              {HY.saveCycle}
            </Text>
            <Text className="mb-2 text-[13px] text-grey-700">
              {HY.enterCycleName}
            </Text>
            <TextField
              placeholder={HY.cycleNamePlaceholder}
              value={name}
              onChangeText={setName}
            />
            <View className="mt-4 flex-row gap-3">
              <View className="flex-1">
                <Button
                  title={HY.cancel}
                  variant="outline"
                  onPress={() => setNameOpen(false)}
                />
              </View>
              <View className="flex-1">
                <Button
                  title={HY.save}
                  disabled={!name.trim()}
                  loading={loading}
                  onPress={() => {
                    onSave(name.trim(), days);
                    setNameOpen(false);
                  }}
                />
              </View>
            </View>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
