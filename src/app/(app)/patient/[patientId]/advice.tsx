import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import { AdviceBtnIcon } from "@/components/svg-components/advice-icon";
import { EditIcon } from "@/components/svg-components/edit-icon";
import { PlasCircle } from "@/components/svg-components/plas-circle";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { HY } from "@/constants/hy";
import { INRAppRoutes } from "@/constants/routes.constants";
import { jsonParsed } from "@/helpers/jsonParsed";
import { useGetPatentInrAdvice } from "@/hooks/inr-norm/useGetPatentInrAdvice.hook";
import type { InrAdviceType } from "@/types/patient-types";
import dayjs from "dayjs";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

function adviceLines(item: InrAdviceType): string[] {
  return item.advices?.length
    ? item.advices.map((entry) => entry.advice)
    : jsonParsed(item.advice ?? "");
}

function isActualAdvice(item: InrAdviceType): boolean {
  return item.advices?.length
    ? item.advices.some((entry) => entry.isActual === 1)
    : item.isActual === 1;
}

function AdviceLines({ lines, muted }: { lines: string[]; muted?: boolean }) {
  const tone = muted ? "text-grey-400" : "text-grey-900";

  return (
    <View className="gap-2">
      {lines.map((line, index) => (
        <View key={`${line}-${index}`} className="flex-row gap-2">
          <Text className={`text-[34px] leading-[22px] ${tone}`}>
            {"\u00B7"}
          </Text>
          <Text className={`min-w-0 flex-1 text-[14px] leading-[22px] ${tone}`}>
            {line}
          </Text>
        </View>
      ))}
    </View>
  );
}

export default function AdviceScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { inrAdvice, isLoadingAdvice, refetch } = useGetPatentInrAdvice({
    patient_id: patientId ?? "",
    page: "1",
    pageSize: "20",
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );

  const openForm = (adviceId?: number) => {
    const path = INRAppRoutes.patientAdviceForm(patientId ?? "");
    router.push(adviceId ? `${path}?adviceId=${adviceId}` : path);
  };

  if (isLoadingAdvice) return <LoadingScreen />;

  const sorted = [...(inrAdvice ?? [])].sort(
    (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
  );
  const actual: InrAdviceType | undefined =
    sorted.find(isActualAdvice) ?? sorted[0];
  const previous = sorted.filter((item) => item.id !== actual?.id);

  const editButton = (item: InrAdviceType) => (
    <Pressable
      onPress={() => openForm(item.id)}
      hitSlop={8}
      accessibilityRole="button"
      accessibilityLabel={HY.edit}
      className="active:opacity-70"
    >
      <EditIcon />
    </Pressable>
  );

  return (
    <AuthenticatedScreen contentClassName="flex-1">
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-4 pb-4 pt-3"
          showsVerticalScrollIndicator={false}
        >
          <PatientSubHeader
            title={HY.advice}
            description={HY.adviceActualHint}
            icon={<AdviceBtnIcon />}
            onBack={() => router.back()}
          />

          {!actual ? (
            <View className="flex-1 items-center justify-center pb-16">
              <Text className="text-[16px] text-grey-400">
                {HY.noSavedAdvice}
              </Text>
            </View>
          ) : (
            <>
              <View className="rounded-[12px] bg-brand-100 p-4">
                <View className="mb-3 flex-row items-start justify-between gap-3">
                  <Text className="min-w-0 flex-1 font-semibold text-[16px] text-brand-900">
                    {HY.actualAdvice}
                  </Text>
                  {editButton(actual)}
                </View>

                <AdviceLines lines={adviceLines(actual)} />

                <Text className="mt-3 text-[12px] leading-5 text-grey-400">
                  {HY.lastUpdate} {dayjs(actual.date).format("DD.MM.YYYY")}
                </Text>
              </View>

              {previous.length ? (
                <>
                  <Text className="mb-3 mt-6 font-semibold text-[16px] text-brand-900">
                    {HY.previousAdvice}
                  </Text>

                  {previous.map((item) => (
                    <View
                      key={item.id}
                      className="mb-3 rounded-[12px] border border-brand-50 bg-brand-10 p-4"
                    >
                      <View className="mb-3 flex-row items-center justify-between gap-3">
                        <Text className="font-semibold text-[16px] text-grey-900">
                          {dayjs(item.date).format("DD.MM.YYYY")}
                        </Text>
                        {editButton(item)}
                      </View>

                      <AdviceLines lines={adviceLines(item)} muted />
                    </View>
                  ))}
                </>
              ) : null}
            </>
          )}
        </ScrollView>

        <View className="gap-2 px-4 pb-2 pt-3">
          <Button
            title={HY.addNewAdvice}
            onPress={() => openForm()}
            icon={(color) => <PlasCircle color={color} />}
          />
          <Button
            title={HY.backToMain}
            variant="outline"
            onPress={() =>
              router.replace(INRAppRoutes.patient(patientId ?? ""))
            }
          />
        </View>
      </View>
    </AuthenticatedScreen>
  );
}
