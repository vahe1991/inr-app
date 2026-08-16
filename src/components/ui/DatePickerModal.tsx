import { HY } from "@/constants/hy";
import dayjs, { type Dayjs } from "dayjs";
import { SymbolView } from "expo-symbols";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Animated,
  Easing,
  Modal,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

const DAY_CELL_WIDTH = "14.2857%";
const MONTH_CELL_WIDTH = "33.3333%";

const CARD_SHADOW = {
  shadowColor: "#000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.08,
  shadowRadius: 6,
  elevation: 3,
};

/** Cells of a month grid, Sunday first, with leading blanks for the offset. */
function monthCells(month: Dayjs) {
  const offset = month.startOf("month").day();
  const total = month.daysInMonth();
  return [
    ...Array.from({ length: offset }, () => null),
    ...Array.from({ length: total }, (_, i) => month.startOf("month").add(i, "day")),
  ];
}

type DatePickerModalProps = {
  visible: boolean;
  value?: Date | null;
  minimumDate?: Date;
  maximumDate?: Date;
  onClose: () => void;
  onConfirm: (date: Date) => void;
};

export function DatePickerModal({
  visible,
  value,
  minimumDate,
  maximumDate,
  onClose,
  onConfirm,
}: DatePickerModalProps) {
  const minTime = minimumDate
    ? dayjs(minimumDate).startOf("day").valueOf()
    : null;
  const maxTime = maximumDate
    ? dayjs(maximumDate).startOf("day").valueOf()
    : null;
  const valueTime = value ? dayjs(value).startOf("day").valueOf() : null;

  const min = useMemo(
    () => (minTime == null ? null : dayjs(minTime)),
    [minTime],
  );
  const max = useMemo(
    () => (maxTime == null ? null : dayjs(maxTime)),
    [maxTime],
  );

  const [viewMonth, setViewMonth] = useState<Dayjs>(() =>
    dayjs(valueTime ?? undefined).startOf("month"),
  );
  const [sheetOpen, setSheetOpen] = useState(false);

  useEffect(() => {
    if (!visible) return;
    setViewMonth(dayjs(valueTime ?? undefined).startOf("month"));
    setSheetOpen(false);
  }, [visible, valueTime]);

  const cells = useMemo(() => monthCells(viewMonth), [viewMonth]);

  const selectedDay = valueTime == null ? null : dayjs(valueTime);
  const isDayDisabled = (day: Dayjs) =>
    Boolean(min && day.isBefore(min, "day")) ||
    Boolean(max && day.isAfter(max, "day"));

  const canGoPrev = !min || viewMonth.isAfter(min, "month");
  const canGoNext = !max || viewMonth.isBefore(max, "month");

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      statusBarTranslucent
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 items-center justify-center bg-black/40 px-4"
        onPress={onClose}
        accessibilityLabel={HY.cancel}
      >
        <Pressable
          className="w-full max-w-[360px] overflow-hidden rounded-3xl bg-brand-100"
          onPress={() => {}}
          style={CARD_SHADOW}
        >
          <View className="flex-row items-center justify-between border-b border-brand-200 px-4 py-4">
            <Pressable
              disabled={!canGoPrev}
              onPress={() => setViewMonth((m) => m.subtract(1, "month"))}
              accessibilityRole="button"
              accessibilityLabel={HY.back}
              className={`h-10 w-10 items-center justify-center rounded-xl bg-white active:opacity-70 ${
                canGoPrev ? "" : "opacity-40"
              }`}
              style={CARD_SHADOW}
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

            <Pressable
              onPress={() => setSheetOpen(true)}
              accessibilityRole="button"
              className="items-center active:opacity-70"
            >
              <Text className="font-semibold text-[20px] leading-7 text-brand-700">
                {HY.months[viewMonth.month()]}
              </Text>
              <View className="flex-row items-center gap-1">
                <Text className="font-medium text-[14px] leading-5 text-brand-300">
                  {viewMonth.year()}
                </Text>
                <SymbolView
                  name={{
                    ios: "chevron.down",
                    android: "keyboard_arrow_down",
                    web: "keyboard_arrow_down",
                  }}
                  size={12}
                  tintColor="#B49ED2"
                />
              </View>
            </Pressable>

            <Pressable
              disabled={!canGoNext}
              onPress={() => setViewMonth((m) => m.add(1, "month"))}
              accessibilityRole="button"
              className={`h-10 w-10 items-center justify-center rounded-xl bg-white active:opacity-70 ${
                canGoNext ? "" : "opacity-40"
              }`}
              style={CARD_SHADOW}
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

          <View className="px-2 pb-4 pt-4">
            <View className="flex-row">
              {HY.weekdaysNarrow.map((weekday, index) => (
                <Text
                  key={`${weekday}-${index}`}
                  style={{ width: DAY_CELL_WIDTH }}
                  className={`text-center font-semibold text-[14px] leading-5 ${
                    index === 0 ? "text-red-500" : "text-brand-500"
                  }`}
                >
                  {weekday}
                </Text>
              ))}
            </View>

            <View className="mt-3 flex-row flex-wrap">
              {cells.map((day, index) => {
                if (!day) {
                  return (
                    <View
                      key={`empty-${index}`}
                      style={{ width: DAY_CELL_WIDTH }}
                      className="h-11"
                    />
                  );
                }

                const selected = Boolean(
                  selectedDay && day.isSame(selectedDay, "day"),
                );
                const disabled = isDayDisabled(day);

                return (
                  <Pressable
                    key={day.valueOf()}
                    disabled={disabled}
                    onPress={() => onConfirm(day.toDate())}
                    style={{ width: DAY_CELL_WIDTH }}
                    accessibilityRole="button"
                    accessibilityState={{ selected, disabled }}
                    accessibilityLabel={day.format("DD.MM.YYYY")}
                    className="h-11 items-center justify-center active:opacity-60"
                  >
                    <Text
                      className={`text-[16px] leading-6 ${
                        disabled
                          ? "text-grey-300"
                          : selected
                            ? "font-semibold text-brand-700"
                            : "text-grey-900"
                      }`}
                    >
                      {day.date()}
                    </Text>
                    {selected ? (
                      <View className="absolute bottom-1 h-1.5 w-1.5 rounded-full bg-brand-700" />
                    ) : null}
                  </Pressable>
                );
              })}
            </View>
          </View>
        </Pressable>
      </Pressable>

      <YearSheet
        visible={sheetOpen}
        year={viewMonth.year()}
        month={viewMonth.month()}
        selectedDay={selectedDay}
        min={min}
        max={max}
        onClose={() => setSheetOpen(false)}
        onSelect={(year, month) => {
          setViewMonth(dayjs().year(year).month(month).startOf("month"));
          setSheetOpen(false);
        }}
      />
    </Modal>
  );
}

type YearSheetProps = {
  visible: boolean;
  year: number;
  month: number;
  selectedDay: Dayjs | null;
  min: Dayjs | null;
  max: Dayjs | null;
  onClose: () => void;
  onSelect: (year: number, month: number) => void;
};

function YearSheet({
  visible,
  year,
  month,
  selectedDay,
  min,
  max,
  onClose,
  onSelect,
}: YearSheetProps) {
  const [draftYear, setDraftYear] = useState(year);
  const slide = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!visible) return;
    setDraftYear(year);
    slide.setValue(0);
    Animated.timing(slide, {
      toValue: 1,
      duration: 220,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, year, slide]);

  if (!visible) return null;

  const canGoPrevYear = !min || draftYear > min.year();
  const canGoNextYear = !max || draftYear < max.year();

  const isMonthDisabled = (index: number) => {
    const start = dayjs().year(draftYear).month(index).startOf("month");
    if (min && start.endOf("month").isBefore(min, "day")) return true;
    if (max && start.isAfter(max, "day")) return true;
    return false;
  };

  return (
    <View className="absolute inset-0 justify-end">
      <Pressable
        className="absolute inset-0 bg-black/40"
        onPress={onClose}
        accessibilityLabel={HY.cancel}
      />
      <Animated.View
        style={{
          transform: [
            {
              translateY: slide.interpolate({
                inputRange: [0, 1],
                outputRange: [420, 0],
              }),
            },
          ],
        }}
      >
        <View className="rounded-t-3xl bg-white pb-8">
          <View className="items-center pb-1 pt-2.5">
            <View className="h-1 w-9 rounded-full bg-brand-200" />
          </View>

          <View className="flex-row items-center justify-between border-b border-grey-50 px-4 pb-3 pt-1">
            <Pressable
              disabled={!canGoPrevYear}
              onPress={() => setDraftYear((y) => y - 1)}
              accessibilityRole="button"
              className={`h-10 w-10 items-center justify-center rounded-xl bg-brand-100 active:opacity-70 ${
                canGoPrevYear ? "" : "opacity-40"
              }`}
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
              disabled={!canGoNextYear}
              onPress={() => setDraftYear((y) => y + 1)}
              accessibilityRole="button"
              className={`h-10 w-10 items-center justify-center rounded-xl bg-brand-100 active:opacity-70 ${
                canGoNextYear ? "" : "opacity-40"
              }`}
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
                disabled={isMonthDisabled(index)}
                selectedDay={selectedDay}
                onPress={() => onSelect(draftYear, index)}
              />
            ))}
          </ScrollView>
        </View>
      </Animated.View>
    </View>
  );
}

type MiniMonthCardProps = {
  name: string;
  month: Dayjs;
  active: boolean;
  disabled: boolean;
  selectedDay: Dayjs | null;
  onPress: () => void;
};

function MiniMonthCard({
  name,
  month,
  active,
  disabled,
  selectedDay,
  onPress,
}: MiniMonthCardProps) {
  const cells = useMemo(() => monthCells(month), [month]);

  return (
    <View style={{ width: MONTH_CELL_WIDTH }} className="p-1.5">
      <Pressable
        disabled={disabled}
        onPress={onPress}
        accessibilityRole="button"
        accessibilityState={{ selected: active, disabled }}
        accessibilityLabel={`${name} ${month.year()}`}
        className={`rounded-xl border px-1.5 pb-2 pt-1.5 ${
          active
            ? "border-brand-300 bg-brand-100"
            : "border-grey-50 bg-white active:bg-brand-10"
        } ${disabled ? "opacity-40" : ""}`}
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
            const marked = Boolean(
              selectedDay && day.isSame(selectedDay, "day"),
            );
            return (
              <View
                key={day.valueOf()}
                style={{ width: DAY_CELL_WIDTH }}
                className="h-[13px] items-center justify-center"
              >
                <View
                  className={`h-[13px] w-[13px] items-center justify-center rounded ${
                    marked ? "bg-brand-200" : ""
                  }`}
                >
                  <Text
                    className={`text-[8px] leading-3 ${
                      marked ? "font-semibold text-brand-700" : "text-grey-400"
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
