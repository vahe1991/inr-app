import { MonthCalendarGrid } from "@/components/calendar/MonthCalendarGrid";
import { MonthPickerSheet } from "@/components/calendar/MonthPickerSheet";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { HY } from "@/constants/hy";
import type { SavedCycleDay } from "@/helpers/calendarItems";
import dayjs, { type Dayjs } from "dayjs";
import { useEffect, useMemo, useRef, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

const DEFAULT_DOSE = 2;

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
      <View className="flex-1 justify-end bg-black/40">
        <View className="max-h-[92%] rounded-t-[24px] bg-white px-4 pb-6 pt-3">
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
                      className="mb-2 flex-row items-center justify-between rounded-[12px] bg-brand-50 px-3 py-3"
                    >
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
                      <View className="flex-row items-center gap-2">
                        <Pressable
                          onPress={() =>
                            setDays((current) =>
                              current.map((day) =>
                                day.date === item.date
                                  ? {
                                      ...day,
                                      dosage:
                                        day.dosage >= 4
                                          ? 0.5
                                          : Math.round((day.dosage + 0.25) * 100) /
                                            100,
                                    }
                                  : day,
                              ),
                            )
                          }
                          className="rounded-lg border border-brand-200 bg-white px-3 py-2"
                        >
                          <Text className="text-[14px] text-calendar-primary">
                            {item.dosage.toFixed(2)}
                            {HY.mg}
                          </Text>
                        </Pressable>
                        <Pressable
                          onPress={() =>
                            setDays((current) =>
                              current.filter((day) => day.date !== item.date),
                            )
                          }
                          className="h-9 w-9 items-center justify-center rounded-lg bg-white"
                        >
                          <Text className="text-[18px] text-calendar-danger">
                            ×
                          </Text>
                        </Pressable>
                      </View>
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

          <View className="mt-4 flex-row items-center justify-between gap-3">
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
