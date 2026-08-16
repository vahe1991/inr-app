import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import { EditBtnIcon } from "@/components/svg-components/edit-icon";
import { Button } from "@/components/ui/Button";
import { FormTextField } from "@/components/ui/FormTextField";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { HY } from "@/constants/hy";
import { useGetPatientInrNorm } from "@/hooks/inr-norm/useGetPatientInrNorm.hook";
import { useUpdatePatientInrNorm } from "@/hooks/inr-norm/useUpdatePatientInrNorm.hook";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { Alert, ScrollView, View } from "react-native";

type EditNormForm = {
  normStart: string;
  normEnd: string;
};

export default function EditNormScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { inrNorm, isLoading } = useGetPatientInrNorm({
    patient_id: patientId ?? "",
    date: dayjs().format("YYYY-MM-DD"),
  });

  const { control, handleSubmit, getValues, reset } = useForm<EditNormForm>({
    defaultValues: { normStart: "", normEnd: "" },
  });

  const { mutate, isPending } = useUpdatePatientInrNorm(() => {
    router.back();
  });

  useEffect(() => {
    if (inrNorm) {
      reset({
        normStart: String(inrNorm.normStart ?? ""),
        normEnd: String(inrNorm.normEnd ?? ""),
      });
    }
  }, [inrNorm, reset]);

  if (isLoading) return <LoadingScreen />;

  const onSave = ({ normStart, normEnd }: EditNormForm) => {
    if (!patientId) {
      Alert.alert(HY.brand, HY.invalidNorm);
      return;
    }
    mutate({
      patient_id: patientId,
      normStart: String(Number(normStart)),
      normEnd: String(Number(normEnd)),
    });
  };

  const numberRules = {
    required: HY.requiredField,
    validate: (raw: string) =>
      (raw.trim() !== "" && !Number.isNaN(Number(raw))) || HY.invalidNumber,
  };

  return (
    <AuthenticatedScreen contentClassName="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10 pt-3"
        keyboardShouldPersistTaps="handled"
      >
        <PatientSubHeader
          title={HY.editInrNorm}
          description={HY.enterNormRange}
          icon={<EditBtnIcon />}
          onBack={() => router.back()}
        />
        <View className="mb-4 flex-row items-start gap-3">
          <View className="flex-1">
            <FormTextField
              control={control}
              name="normStart"
              rules={numberRules}
              label={HY.normStart}
              keyboardType="decimal-pad"
              placeholder="00.00"
            />
          </View>
          <View className="flex-1">
            <FormTextField
              control={control}
              name="normEnd"
              rules={{
                ...numberRules,
                validate: (raw: string) => {
                  const base = numberRules.validate(raw);
                  if (base !== true) return base;
                  return (
                    Number(getValues("normStart")) < Number(raw) || HY.normOrder
                  );
                },
              }}
              label={HY.normEnd}
              keyboardType="decimal-pad"
              placeholder="00.00"
            />
          </View>
        </View>
        <Button
          title={HY.save}
          onPress={handleSubmit(onSave)}
          loading={isPending}
        />
      </ScrollView>
    </AuthenticatedScreen>
  );
}
