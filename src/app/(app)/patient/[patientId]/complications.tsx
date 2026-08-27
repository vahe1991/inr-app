import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import { Permission } from "@/components/permission/Permission";
import { PermissionGate } from "@/components/permission/PermissionGate";
import { ComplexityBtnIcon } from "@/components/svg-components/complexity-icon";
import { EditIcon } from "@/components/svg-components/edit-icon";
import { PlasCircle } from "@/components/svg-components/plas-circle";
import { SuccessIcon } from "@/components/svg-components/success-icon";
import { Button } from "@/components/ui/Button";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { HY } from "@/constants/hy";
import { ApiPaths } from "@/constants/apiPaths";
import { INRAppRoutes } from "@/constants/routes.constants";
import { useGetPatientInrComplication } from "@/hooks/inr-norm/useGetPatientInrComplication.hook";
import type { InrComplicationType } from "@/types/patient-types";
import dayjs from "dayjs";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";

export default function ComplicationsScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { inrComplication, isLoadingComplication, refetch } =
    useGetPatientInrComplication({
      patient_id: patientId ?? "",
      page: "1",
      pageSize: "20",
    });

  useFocusEffect(
    useCallback(() => {
      void refetch();
    }, [refetch]),
  );
  const openForm = (item?: InrComplicationType) => {
    router.push({
      pathname: INRAppRoutes.patientComplicationForm(patientId ?? ""),
      params: item ? { complication: JSON.stringify(item) } : {},
    });
  };

  if (isLoadingComplication) return <LoadingScreen />;

  const sorted = [...(inrComplication ?? [])].sort(
    (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
  );

  return (
    <PermissionGate
      method="GET"
      path={ApiPaths.patientInrComplication(patientId ?? "{patientId}")}
    >
    <AuthenticatedScreen contentClassName="flex-1">
      <View className="flex-1">
        <ScrollView
          className="flex-1"
          contentContainerClassName="flex-grow px-4 pb-4 pt-3"
          showsVerticalScrollIndicator={false}
        >
          <PatientSubHeader
            title={HY.complications}
            icon={<ComplexityBtnIcon />}
            onBack={() => router.back()}
          />

          {!sorted.length ? (
            <View className="flex-1 items-center justify-center pb-16">
              <Text className="text-[16px] text-grey-400">
                {HY.noSavedComplications}
              </Text>
            </View>
          ) : (
            sorted.map((item) => (
              <View
                key={item.id}
                className="mb-4 rounded-[12px] bg-brand-100 p-4"
              >
                <View className="mb-3 flex-row items-center justify-between gap-3">
                  <Text className="font-semibold text-[16px] text-grey-900">
                    {dayjs(item.date).format("DD.MM.YYYY")}
                  </Text>

                  <Permission
                    method="POST"
                    path={ApiPaths.patientInrComplication(
                      patientId ?? "{patientId}",
                    )}
                  >
                  <Pressable
                    onPress={() => openForm(item)}
                    hitSlop={8}
                    accessibilityRole="button"
                    accessibilityLabel={HY.edit}
                    className="h-9 w-9 items-center justify-center rounded-lg bg-calendar-primary active:opacity-80"
                  >
                    <EditIcon color="#ffffff" />
                  </Pressable>
                  </Permission>
                </View>

                <View className="gap-2">
                  {(item as InrComplicationType)?.complications?.map(
                    (cpl, index) => (
                      <View
                        key={`${item.id}-${index}`}
                        className="flex-row gap-2"
                      >
                        <View
                          className={`h-4 w-4 mt-[6px] items-center justify-center rounded-[2px] border-[0.5px] border-brand-300 bg-white`}
                        >
                          {cpl?.isActual === 1 ? (
                            <SuccessIcon color="#502e7f" width={9} height={7} />
                          ) : null}
                        </View>
                        <Text className="min-w-0 flex-1 text-[14px] leading-[22px] text-grey-900">
                          {cpl?.complication}
                        </Text>
                      </View>
                    ),
                  )}
                </View>
              </View>
            ))
          )}
        </ScrollView>

        <View className="px-4 pb-2 pt-3">
          <Permission
            method="POST"
            path={ApiPaths.patientInrComplication(patientId ?? "{patientId}")}
          >
          <Button
            title={HY.addNewComplication}
            onPress={() => openForm()}
            icon={(color) => <PlasCircle color={color} />}
          />
          </Permission>
        </View>
      </View>
    </AuthenticatedScreen>
    </PermissionGate>
  );
}
