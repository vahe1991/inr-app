import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import { HeartBtnIcon } from "@/components/svg-components/heart-btn-icon";
import { SuccessIcon } from "@/components/svg-components/success-icon";
import { TrashIcon } from "@/components/svg-components/trash-icon";
import { WarningIcon } from "@/components/svg-components/warning-icon";
import { ConfirmModal } from "@/components/ui/ConfirmModal";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { HY } from "@/constants/hy";
import { useDeletePatientInr } from "@/hooks/inr-norm/useDeletePatientInr.hook";
import { useGetPatientAllInr } from "@/hooks/inr-norm/useGetPatientAllInr.hook";
import { useGetPatientInr } from "@/hooks/inr-norm/useGetPatientInr.hook";
import type { InrType, PatientInrType } from "@/types/inr-types";
import dayjs from "dayjs";
import { useFocusEffect, useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

export default function PatientInrHistoryScreen() {
  const router = useRouter();
  const { patientId, created } = useLocalSearchParams<{
    patientId: string;
    created?: string;
  }>();
  const [successMessage, setSuccessMessage] = useState<string | null>(
    created === "1" ? HY.inrAddedSuccess : null,
  );
  const [deleteTargetId, setDeleteTargetId] = useState<number | null>(null);

  const {
    inrPatentData,
    refetch: refetchPatientInr,
  }: {
    inrPatentData: PatientInrType | undefined;
    refetch: () => void;
  } = useGetPatientInr({
    patient_id: patientId ?? "",
    date: dayjs(new Date()).format("YYYY-MM-DD"),
  });
  const { allInr, isLoading, refetch } = useGetPatientAllInr({
    patient_id: patientId ?? "",
    page: "1",
    pageSize: "50",
  });

  useFocusEffect(
    useCallback(() => {
      void refetch();
      void refetchPatientInr();
    }, [refetch, refetchPatientInr]),
  );
  const {
    mutate: deletePatientInr,
    isPending: isDeletingPatientInr,
    variables,
  } = useDeletePatientInr(() => {
    setSuccessMessage(HY.inrDeletedSuccess);
    void refetch();
  });

  const sorted = [...(allInr?.items ?? [])].sort(
    (a, b) => dayjs(b.date).valueOf() - dayjs(a.date).valueOf(),
  );
  const [latest, ...previous] = sorted;

  const isInrInNormRange = (value: number) => {
    if (!inrPatentData) return false;
    return value > inrPatentData.normStart && value < inrPatentData.normEnd;
  };

  const handleConfirmDelete = () => {
    if (deleteTargetId === null) return;
    deletePatientInr({ patient_id: patientId ?? "", inrId: deleteTargetId });
    setDeleteTargetId(null);
  };

  const renderRow = (item: InrType) => (
    <View
      key={item.id}
      className="mb-2 flex-row items-center justify-start gap-[12px] rounded-[8px] border border-brand-10 px-3 py-3"
    >
      <Text className="mr-[auto] font-medium text-sm text-grey-900">
        {item.date ? dayjs(item.date).format("DD.MM.YYYY") : "."}
      </Text>

      <View
        className="min-w-[79px] flex-row items-center justify-between gap-[8px] rounded-[4px] bg-brand-100 px-[12px] py-[4px]"
        style={{
          shadowColor: "#000",
          shadowOffset: {
            width: 0,
            height: 1,
          },
          shadowOpacity: 0.2,
          shadowRadius: 1.41,

          elevation: 2,
        }}
      >
        <Text className="text-[16px] text-brand-700">{item.value}</Text>
        {isInrInNormRange(item.value) ? <SuccessIcon /> : <WarningIcon />}
      </View>

      {variables?.inrId === item.id && isDeletingPatientInr ? (
        <ActivityIndicator size="small" color="#FF4D4F" />
      ) : (
        <Pressable
          hitSlop={8}
          accessibilityRole="button"
          accessibilityLabel={HY.delete}
          onPress={() => setDeleteTargetId(item.id)}
        >
          <TrashIcon />
        </Pressable>
      )}
    </View>
  );

  if (isLoading)
    return (
      <>
        <LoadingScreen />
        <SuccessModal
          visible={successMessage !== null}
          title={successMessage ?? ""}
          onClose={() => setSuccessMessage(null)}
        />
      </>
    );

  return (
    <AuthenticatedScreen contentClassName="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10 pt-3"
        showsVerticalScrollIndicator={false}
      >
        <PatientSubHeader
          title={HY.inrHistory}
          description={HY.allInrResults}
          icon={<HeartBtnIcon />}
          onBack={() => router.back()}
        />

        {!latest ? (
          <Text className="text-sm text-calendar-text-secondary">
            {HY.noInrResults}
          </Text>
        ) : (
          <>
            <Text className="mb-2 font-[600] text-[16px] text-grey-900">
              {HY.latestInrResult}
            </Text>
            {renderRow(latest)}

            {previous.length ? (
              <>
                <Text className="mb-2 mt-4 font-[600] text-[16px] text-grey-900">
                  {HY.previousResults}
                </Text>
                {previous.map(renderRow)}
              </>
            ) : null}
          </>
        )}
      </ScrollView>

      <SuccessModal
        visible={successMessage !== null}
        title={successMessage ?? ""}
        onClose={() => setSuccessMessage(null)}
      />

      <ConfirmModal
        visible={deleteTargetId !== null}
        title={HY.deleteInrConfirm}
        confirmLabel={HY.delete}
        destructive
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteTargetId(null)}
      />
    </AuthenticatedScreen>
  );
}
