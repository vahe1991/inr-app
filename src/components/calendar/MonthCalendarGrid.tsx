import { HY } from "@/constants/hy";
import { datesInRange } from "@/helpers/calendarItems";
import { type Dayjs } from "dayjs";
import { SymbolView } from "expo-symbols";
import { useMemo, useRef } from "react";
import {
  PanResponder,
  Pressable,
  Text,
  View,
  type GestureResponderEvent,
} from "react-native";

export type DayMark = {
  dot?: "purple" | "red";
  dosage?: number;
  inRange?: boolean;
  rangeEdge?: boolean;
};

type MonthCalendarGridProps = {
  month: Dayjs;
  selected?: string;
  marks?: Record<string, DayMark>;
  size?: "md" | "sm";
  showHeader?: boolean;
  showWeekdays?: boolean;
  onPrev?: () => void;
  onNext?: () => void;
  onPressTitle?: () => void;
  onSelectDay?: (date: string) => void;
  onSelectRange?: (dates: string[]) => void;
  onDragStateChange?: (dragging: boolean) => void;
};

function monthDays(month: Dayjs) {
  const first = month.startOf("month");
  const offset = first.day();
  const gridStart = first.subtract(offset, "day");
  const cells = Math.ceil((offset + month.daysInMonth()) / 7) * 7;
  return Array.from({ length: cells }, (_, i) => gridStart.add(i, "day"));
}

export function MonthCalendarGrid({
  month,
  selected,
  marks = {},
  size = "md",
  showHeader = true,
  showWeekdays = true,
  onPrev,
  onNext,
  onPressTitle,
  onSelectDay,
  onSelectRange,
  onDragStateChange,
}: MonthCalendarGridProps) {
  const days = useMemo(() => monthDays(month), [month]);
  const compact = size === "sm";
  const gridRef = useRef<View>(null);
  const layoutRef = useRef({ x: 0, y: 0, width: 0, height: 0 });
  const dragStartRef = useRef<string | null>(null);
  const draggedRef = useRef(false);
  const skipPressRef = useRef(false);
  const daysRef = useRef(days);
  const monthRef = useRef(month);
  const onSelectDayRef = useRef(onSelectDay);
  const onSelectRangeRef = useRef(onSelectRange);
  const onDragStateChangeRef = useRef(onDragStateChange);

  daysRef.current = days;
  monthRef.current = month;
  onSelectDayRef.current = onSelectDay;
  onSelectRangeRef.current = onSelectRange;
  onDragStateChangeRef.current = onDragStateChange;

  const measureGrid = () => {
    gridRef.current?.measureInWindow((x, y, width, height) => {
      layoutRef.current = { x, y, width, height };
    });
  };

  const dateAtPoint = (pageX: number, pageY: number) => {
    const { x, y, width, height } = layoutRef.current;
    if (!width || !height) return null;
    const cells = daysRef.current;
    const rows = cells.length / 7;
    const col = Math.floor((pageX - x) / (width / 7));
    const row = Math.floor((pageY - y) / (height / rows));
    if (col < 0 || col > 6 || row < 0 || row >= rows) return null;
    const day = cells[row * 7 + col];
    if (!day || day.month() !== monthRef.current.month()) return null;
    return day.format("YYYY-MM-DD");
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => false,
      onMoveShouldSetPanResponder: (_, gesture) =>
        !compact &&
        Boolean(onSelectRangeRef.current) &&
        Math.abs(gesture.dx) + Math.abs(gesture.dy) > 6,
      onPanResponderGrant: (event: GestureResponderEvent) => {
        measureGrid();
        draggedRef.current = false;
        skipPressRef.current = false;
        dragStartRef.current =
          dragStartRef.current ??
          dateAtPoint(event.nativeEvent.pageX, event.nativeEvent.pageY);
        onDragStateChangeRef.current?.(true);
      },
      onPanResponderMove: (event: GestureResponderEvent) => {
        const date = dateAtPoint(
          event.nativeEvent.pageX,
          event.nativeEvent.pageY,
        );
        if (!date || !dragStartRef.current) return;
        if (date !== dragStartRef.current) draggedRef.current = true;
        onSelectRangeRef.current?.(datesInRange(dragStartRef.current, date));
      },
      onPanResponderRelease: (event: GestureResponderEvent) => {
        const date =
          dateAtPoint(event.nativeEvent.pageX, event.nativeEvent.pageY) ??
          dragStartRef.current;
        if (draggedRef.current && dragStartRef.current && date) {
          skipPressRef.current = true;
          onSelectRangeRef.current?.(datesInRange(dragStartRef.current, date));
        }
        onDragStateChangeRef.current?.(false);
        dragStartRef.current = null;
        draggedRef.current = false;
      },
      onPanResponderTerminationRequest: () => false,
      onPanResponderTerminate: () => {
        onDragStateChangeRef.current?.(false);
        dragStartRef.current = null;
        draggedRef.current = false;
      },
    }),
  ).current;

  return (
    <View className={compact ? "" : "rounded-[16px] bg-brand-50 p-3"}>
      {showHeader ? (
        <View className="mb-3 flex-row items-center justify-between">
          {onPrev ? (
            <Pressable
              onPress={onPrev}
              className="h-10 w-10 items-center justify-center rounded-xl bg-white active:opacity-70"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 3,
              }}
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
          ) : (
            <View className="w-10" />
          )}
          <Pressable
            onPress={onPressTitle}
            disabled={!onPressTitle}
            className="items-center active:opacity-70"
          >
            <Text className="font-semibold text-[20px] leading-7 text-brand-700">
              {HY.months[month.month()]}
            </Text>
            <View className="flex-row items-center gap-1">
              <Text className="font-medium text-[14px] leading-5 text-brand-300">
                {month.year()}
              </Text>
              {onPressTitle ? (
                <SymbolView
                  name={{
                    ios: "chevron.down",
                    android: "keyboard_arrow_down",
                    web: "keyboard_arrow_down",
                  }}
                  size={12}
                  tintColor="#B49ED2"
                />
              ) : null}
            </View>
          </Pressable>
          {onNext ? (
            <Pressable
              onPress={onNext}
              className="h-10 w-10 items-center justify-center rounded-xl bg-white active:opacity-70"
              style={{
                shadowColor: "#000",
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.08,
                shadowRadius: 6,
                elevation: 3,
              }}
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
          ) : (
            <View className="w-10" />
          )}
        </View>
      ) : null}

      {showWeekdays ? (
        <View className="mb-1 flex-row">
          {HY.weekdaysNarrow.map((label, index) => (
            <Text
              key={`${label}-${index}`}
              className={`flex-1 text-center text-[11px] ${
                index === 0 ? "text-calendar-danger" : "text-calendar-text-muted"
              }`}
            >
              {label}
            </Text>
          ))}
        </View>
      ) : null}

      <View
        ref={gridRef}
        collapsable={false}
        onLayout={measureGrid}
        onTouchStart={(event) => {
          measureGrid();
          dragStartRef.current = dateAtPoint(
            event.nativeEvent.pageX,
            event.nativeEvent.pageY,
          );
        }}
        {...(compact ? undefined : panResponder.panHandlers)}
        className="flex-row flex-wrap"
      >
        {days.map((day) => {
          const key = day.format("YYYY-MM-DD");
          const inMonth = day.month() === month.month();
          const active = key === selected;
          const mark = marks[key];
          const inRange = Boolean(mark?.inRange);
          const rangeEdge = Boolean(mark?.rangeEdge);

          return (
            <Pressable
              key={key}
              onPress={() => {
                if (skipPressRef.current) {
                  skipPressRef.current = false;
                  return;
                }
                if (inMonth) onSelectDay?.(key);
              }}
              style={{ width: "14.28%" }}
              className={`items-center justify-center ${
                compact ? "h-7" : "mb-1 min-h-11"
              } ${
                rangeEdge
                  ? "rounded-lg bg-calendar-primary"
                  : inRange
                    ? "bg-brand-200"
                    : active && !compact
                      ? "rounded-lg"
                      : ""
              }`}
            >
              {inMonth ? (
                <View className="items-center">
                  <View
                    className={`items-center justify-center ${
                      compact
                        ? `h-5 w-5 rounded ${active || rangeEdge ? "bg-calendar-primary" : ""}`
                        : ""
                    }`}
                  >
                    <Text
                      className={`${compact ? "text-[10px]" : "font-semibold text-sm"} ${
                        rangeEdge || (compact && active)
                          ? "text-white"
                          : inMonth
                            ? "text-grey-900"
                            : "text-calendar-text-muted"
                      }`}
                    >
                      {day.date()}
                    </Text>
                  </View>
                  {!compact && mark?.dosage != null ? (
                    <Text
                      className={`text-[9px] ${
                        rangeEdge ? "text-white" : "text-calendar-primary"
                      }`}
                    >
                      {mark.dosage}
                      {HY.mg}
                    </Text>
                  ) : null}
                  {mark?.dot === "red" ? (
                    <View className="mt-0.5 h-[7px] w-[7px] rounded-full bg-red-700" />
                  ) : !compact && mark?.dosage == null && mark?.dot === "purple" ? (
                    <View className="mt-0.5 h-1.5 w-1.5 rounded-full bg-calendar-primary" />
                  ) : !compact && mark?.dosage == null && active ? (
                    <View className="mt-0.5 h-1.5 w-1.5 rounded-full bg-calendar-primary" />
                  ) : mark?.dosage == null ? (
                    <View className="mt-0.5 h-1.5 w-1.5" />
                  ) : null}
                </View>
              ) : (
                <View className={compact ? "h-5" : "h-6"} />
              )}
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
