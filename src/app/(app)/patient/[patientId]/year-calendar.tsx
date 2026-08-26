import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { MonthCalendarGrid } from "@/components/calendar/MonthCalendarGrid";
import { ArrowLeftIcon } from "@/components/svg-components/arrow-left-icon";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { HY } from "@/constants/hy";
import { INRAppRoutes } from "@/constants/routes.constants";
import { asCalendarItems } from "@/helpers/calendarItems";
import { useGetInrWarfarinCalendarDosage } from "@/hooks/calendar/useGetInrWarfarinCalendarDosage.hook";
import dayjs from "dayjs";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function YearCalendarScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const [year, setYear] = useState(dayjs().year());

  const { calendarDosages, isLoadingCalendarDosage, refetch } =
    useGetInrWarfarinCalendarDosage({
      patient_id: patientId ?? "",
      page: 1,
      pageSize: 100,
    });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const marks = useMemo(() => {
    const next: Record<string, { dot?: "purple" | "red"; dosage?: number }> =
      {};
    asCalendarItems(calendarDosages).forEach((item) => {
      const key = dayjs(item.date).format("YYYY-MM-DD");
      next[key] = { dot: "purple", dosage: item.dosage };
    });
    (calendarDosages?.nextTestGiveDates ?? []).forEach((item) => {
      const raw = item.date || item.visitDate;
      if (!raw) return;
      const key = dayjs(raw).format("YYYY-MM-DD");
      next[key] = { ...next[key], dot: "red" };
    });
    return next;
  }, [calendarDosages]);

  const currentMonth = dayjs().month();
  const currentYear = dayjs().year();

  return (
    <AuthenticatedScreen contentClassName="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-8 pt-3"
      >
        <Pressable
          onPress={() => router.back()}
          className="mb-2 h-12 w-12 items-start justify-center"
        >
          <ArrowLeftIcon />
        </Pressable>

        <View className="mb-4 flex-row items-center justify-between">
          <Pressable
            onPress={() => setYear((value) => value - 1)}
            className="h-9 w-9 items-center justify-center rounded-lg bg-brand-100"
          >
            <Text className="font-bold text-lg text-calendar-primary">‹</Text>
          </Pressable>
          <Text className="font-bold text-[22px] text-grey-900">{year}</Text>
          <Pressable
            onPress={() => setYear((value) => value + 1)}
            className="h-9 w-9 items-center justify-center rounded-lg bg-brand-100"
          >
            <Text className="font-bold text-lg text-calendar-primary">›</Text>
          </Pressable>
        </View>

        <View className="flex-row flex-wrap justify-between">
          {HY.months.map((label, monthIndex) => {
            const month = dayjs().year(year).month(monthIndex).startOf("month");
            const isCurrent =
              year === currentYear && monthIndex === currentMonth;
            return (
              <View
                key={label}
                className={`mb-3 w-[32%] rounded-[12px] border p-1.5 ${
                  isCurrent
                    ? "border-calendar-primary bg-brand-50"
                    : "border-brand-100 bg-white"
                }`}
              >
                <Text className="mb-1 text-center text-[11px] text-grey-900">
                  {label}
                </Text>
                <MonthCalendarGrid
                  month={month}
                  size="sm"
                  showHeader={false}
                  showWeekdays={false}
                  marks={marks}
                  onSelectDay={(date) =>
                    router.push(
                      `${INRAppRoutes.patientCalendar(patientId ?? "", "dose")}&date=${date}`,
                    )
                  }
                />
              </View>
            );
          })}
        </View>
      </ScrollView>
    </AuthenticatedScreen>
  );
}
