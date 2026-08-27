import { ActionCard } from "@/components/layout/ActionCard";
import { NavRow } from "@/components/layout/NavRow";
import { InrScaleCard } from "@/components/patient/InrScaleCard";
import { PatientAvatar } from "@/components/patient/PatientAvatar";
import { AdviceIcon } from "@/components/svg-components/advice-icon";
import { ArrowLeftIcon } from "@/components/svg-components/arrow-left-icon";
import { CalendarIcon } from "@/components/svg-components/calendar-icon";
import { ComplexityIcon } from "@/components/svg-components/complexity-icon";
import { HeartIcon } from "@/components/svg-components/heart-icon";
import { PlasIcon } from "@/components/svg-components/plas-icon";
import { HY } from "@/constants/hy";
import { ApiPaths } from "@/constants/apiPaths";
import { INRAppRoutes } from "@/constants/routes.constants";
import { useCan } from "@/hooks/usePermission.hook";
import type { PatientType } from "@/types/patient-types";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

type PatientDashboardProps = {
  patient?: PatientType;
  patientId: string;
  normStart?: number | null;
  normEnd?: number | null;
  currentInr?: number | null;
  dailyDose?: number | string | null;
  nextTestLabel?: string | null;
  onBack?: () => void;
};

export function PatientDashboard({
  patient,
  patientId,
  normStart,
  normEnd,
  currentInr,
  dailyDose = 0,
  nextTestLabel,
  onBack,
}: PatientDashboardProps) {
  const router = useRouter();
  const photo = patient?.photo ?? patient?.image ?? patient?.avatar;
  const canCalendar = useCan("GET", ApiPaths.patientWarfarinCalendar(patientId));
  const canHistory = useCan("GET", ApiPaths.patientInr(patientId));
  const canCreateInr = useCan("POST", ApiPaths.patientInr(patientId));
  const canAdvice = useCan("GET", ApiPaths.patientInrAdvice(patientId));
  const canComplications = useCan(
    "GET",
    ApiPaths.patientInrComplication(patientId),
  );

  return (
    <View className="gap-2">
      {onBack ? (
        <Pressable
          onPress={onBack}
          hitSlop={8}
          className=" pt-[15px] pb-[6px] w-[58px] items-center justify-center active:opacity-80"
          accessibilityRole="button"
          accessibilityLabel={HY.back}
        >
          <ArrowLeftIcon />
        </Pressable>
      ) : null}
      <View className={`mb-4 flex-row items-center gap-3 px-4 ${onBack ? "" : "pt-[15px]"}`}>
        <PatientAvatar photo={photo} gender={patient?.gender} />

        <Text
          className="min-w-0 flex-1 font-bold text-base text-grey-900"
          numberOfLines={1}
        >
          {patient?.fullName || HY.patient}
        </Text>

        {patient?.id != null ? (
          <Text className="rounded-[4px] bg-brand-700 px-[6px] py-[2px] font-[500] text-[14px] text-white">
            {HY.idLabel}: {patient.id}
          </Text>
        ) : null}
      </View>

      <View className="gap-2 px-4 pb-8">
        <InrScaleCard
          patientId={patientId}
          normStart={normStart}
          normEnd={normEnd}
          currentInr={currentInr}
          onEdit={() => router.push(INRAppRoutes.patientEditNorm(patientId))}
        />

        <View className="flex-row gap-2">
          {canCalendar ? (
          <Pressable
            onPress={() =>
              router.push(INRAppRoutes.patientDailyNotesCalendar(patientId, "dose"))
            }
            className="flex-1 items-center justify-center  rounded-tl-[13px]  bg-brand-50 gap-[20px] px-3 py-5 active:opacity-80"
          >
            <Text className="text-center font-[600] text-[16px] text-grey-900">
              {HY.dailyDose}
            </Text>

            <Text className="rounded-[4px] bg-brand-700 px-3 py-2 text-center text-[12px] text-white">
              {dailyDose ?? 0}
            </Text>
          </Pressable>
          ) : null}

          {canCalendar ? (
          <Pressable
            onPress={() =>
              router.push(INRAppRoutes.patientDailyNotesCalendar(patientId, "test"))
            }
            className="flex-1 items-center justify-center  rounded-tr-[13px]  bg-brand-50 gap-[20px] px-3 py-5 active:opacity-80"
          >
            <Text className="text-center font-[600] text-[16px] text-grey-900">
              {HY.nextTest}
            </Text>

            <Text className="rounded-[4px] bg-brand-700 px-3 py-2 text-center text-[12px] text-white">
              {nextTestLabel || HY.notScheduled}
            </Text>
          </Pressable>
          ) : null}
        </View>

        <View className="flex-row gap-2">
          {canHistory ? (
          <ActionCard
            label={HY.inrHistory}
            icon={<HeartIcon />}
            onPress={() => router.push(INRAppRoutes.patientHistory(patientId))}
          />
          ) : null}
          {canCreateInr ? (
          <ActionCard
            className="rounded-bl-[13px]"
            label={HY.newInr}
            icon={<PlasIcon />}
            onPress={() => router.push(INRAppRoutes.patientNewInr(patientId))}
          />
          ) : null}
          {canCalendar ? (
          <ActionCard
            className="rounded-br-[13px]"
            label={HY.calendar}
            icon={<CalendarIcon />}
            onPress={() => router.push(INRAppRoutes.patientCalendar(patientId))}
          />
          ) : null}
        </View>

        <View className="gap-2">
          {canAdvice ? (
          <NavRow
            label={HY.advice}
            icon={<AdviceIcon />}
            onPress={() => router.push(INRAppRoutes.patientAdvice(patientId))}
          />
          ) : null}
          {canComplications ? (
          <NavRow
            label={HY.complications}
            icon={<ComplexityIcon />}
            onPress={() =>
              router.push(INRAppRoutes.patientComplications(patientId))
            }
          />
          ) : null}
        </View>
      </View>
    </View>
  );
}
