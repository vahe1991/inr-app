import { HY } from "@/constants/hy";
import dayjs, { type Dayjs } from "dayjs";
import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useState } from "react";
import { Modal, Pressable, ScrollView, Text, View } from "react-native";

const DAY_CELL_WIDTH = "14.2857%";
const MONTH_CELL_WIDTH = "33.3333%";

function monthCells(month: Dayjs) {
  const offset = month.startOf("month").day();
  const total = month.daysInMonth();
  return [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: total }, (_, i) =>
      month.startOf("month").add(i, "day"),
    ),
  ];
}

type MonthPickerSheetProps = {
  visible: boolean;
  year: number;
  month: number;
  markedDates?: string[];
  selectedDay?: Dayjs | null;
  onClose: () => void;
  onSelect: (year: number, month: number) => void;
};

export function MonthPickerSheet({
  visible,
  year,
  month,
  markedDates = [],
  selectedDay = null,
  onClose,
  onSelect,
}: MonthPickerSheetProps) {
  const [draftYear, setDraftYear] = useState(year);
  const marked = useMemo(() => new Set(markedDates), [markedDates]);

  useEffect(() => {
    if (visible) setDraftYear(year);
  }, [visible, year]);

  return (
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
        <View className="max-h-[88%] rounded-t-3xl bg-white pb-8">
          <View className="items-center pb-1 pt-2.5">
            <View className="h-1 w-9 rounded-full bg-brand-200" />
          </View>

          <View className="flex-row items-center justify-between border-b border-grey-50 px-4 pb-3 pt-1">
            <Pressable
              onPress={() => setDraftYear((value) => value - 1)}
              accessibilityRole="button"
              className="h-10 w-10 items-center justify-center rounded-xl bg-brand-100 active:opacity-70"
            >
              <SymbolView
                name={{
                  ios: "chevron.left",
                  android: "chevron_left",
                  web: "chevron_left",
                }}
                size={18}
                tintColor="#6A4A98"
              />
            </Pressable>

            <Text className="font-bold text-[22px] leading-7 text-grey-900">
              {draftYear}
            </Text>

            <Pressable
              onPress={() => setDraftYear((value) => value + 1)}
              accessibilityRole="button"
              className="h-10 w-10 items-center justify-center rounded-xl bg-brand-100 active:opacity-70"
            >
              <SymbolView
                name={{
                  ios: "chevron.right",
                  android: "chevron_right",
                  web: "chevron_right",
                }}
                size={18}
                tintColor="#6A4A98"
              />
            </Pressable>
          </View>

          <ScrollView
            className="max-h-[540px]"
            contentContainerClassName="flex-row flex-wrap px-2 py-3"
            showsVerticalScrollIndicator={false}
          >
            {HY.months.map((monthName, index) => (
              <MiniMonthCard
                key={monthName}
                name={monthName}
                month={dayjs().year(draftYear).month(index).startOf("month")}
                active={index === month && draftYear === year}
                marked={marked}
                selectedDay={selectedDay}
                onPress={() => onSelect(draftYear, index)}
              />
            ))}
          </ScrollView>
        </View>
      </View>
    </Modal>
  );
}

type MiniMonthCardProps = {
  name: string;
  month: Dayjs;
  active: boolean;
  marked: Set<string>;
  selectedDay: Dayjs | null;
  onPress: () => void;
};

function MiniMonthCard({
  name,
  month,
  active,
  marked,
  selectedDay,
  onPress,
}: MiniMonthCardProps) {
  const cells = useMemo(() => monthCells(month), [month]);

  return (
    <View style={{ width: MONTH_CELL_WIDTH }} className="p-1.5">
      <Pressable
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: active }}
        accessibilityLabel={`${name} ${month.year()}`}
        className={`rounded-xl border px-1.5 pb-2 pt-1.5 ${
          active
            ? "border-calendar-primary bg-brand-50"
            : "border-brand-100 bg-white active:bg-brand-10"
        }`}
      >
        <Text
          className={`mb-1 text-center text-[12px] leading-4 ${
            active ? "font-semibold text-brand-700" : "text-grey-900"
          }`}
        >
          {name}
        </Text>

        <View className="flex-row flex-wrap">
          {cells.map((day, index) => {
            if (!day) {
              return (
                <View
                  key={`mini-empty-${index}`}
                  style={{ width: DAY_CELL_WIDTH }}
                  className="h-[13px]"
                />
              );
            }

            const key = day.format("YYYY-MM-DD");
            const highlighted =
              marked.has(key) ||
              Boolean(selectedDay && day.isSame(selectedDay, "day"));

            return (
              <View
                key={day.valueOf()}
                style={{ width: DAY_CELL_WIDTH }}
                className="h-[13px] items-center justify-center"
              >
                <View
                  className={`h-[13px] w-[13px] items-center justify-center rounded ${
                    highlighted ? "bg-calendar-primary" : ""
                  }`}
                >
                  <Text
                    className={`text-[8px] leading-3 ${
                      highlighted
                        ? "font-semibold text-white"
                        : "text-grey-400"
                    }`}
                  >
                    {day.date()}
                  </Text>
                </View>
              </View>
            );
          })}
        </View>
      </Pressable>
    </View>
  );
}
