import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import { ComplexityBtnIcon } from "@/components/svg-components/complexity-icon";
import { Button } from "@/components/ui/Button";
import { FormDateField } from "@/components/ui/FormDateField";
import { FormSelectField } from "@/components/ui/FormSelectField";
import { FormTextField } from "@/components/ui/FormTextField";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { HY } from "@/constants/hy";
import { jsonParsed } from "@/helpers/jsonParsed";
import { useCreateOrUpdateInrComplication } from "@/hooks/inr-norm/useCreateOrUpdateInrComplication.hook";
import { useGetPatientInrComplication } from "@/hooks/inr-norm/useGetPatientInrComplication.hook";
import type { InrComplicationType } from "@/types/patient-types";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

const MAX_ENTRIES = 3;

const COMPLICATION_TYPES = ["1", "2", "3", "4", "5"].map((value) => ({
  label: value,
  value,
}));

type ComplicationForm = {
  date: string;
  isActual: boolean;
  complicationType: string;
  complication: { value: string }[];
};

const emptyForm = (): ComplicationForm => ({
  date: dayjs().format("YYYY-MM-DD"),
  isActual: true,
  complicationType: "1",
  complication: [{ value: "" }],
});

export default function ComplicationsScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { inrComplication, isLoadingComplication, refetch } =
    useGetPatientInrComplication({
      patient_id: patientId ?? "",
      page: "1",
      pageSize: "20",
    });

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<InrComplicationType | null>(null);

  const { control, handleSubmit, reset } = useForm<ComplicationForm>({
    defaultValues: emptyForm(),
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "complication",
  });

  const { mutate, isPending } = useCreateOrUpdateInrComplication(() => {
    closeForm();
    void refetch();
  });

  if (isLoadingComplication) return <LoadingScreen />;

  function closeForm() {
    setShowForm(false);
    setEditing(null);
    reset(emptyForm());
  }

  const openCreate = () => {
    setEditing(null);
    reset(emptyForm());
    setShowForm(true);
  };

  const openEdit = (item: InrComplicationType) => {
    setEditing(item);
    reset({
      date: dayjs(item.date).format("YYYY-MM-DD"),
      isActual: item.isActual === 1,
      complicationType: String(item.complicationType),
      complication: jsonParsed(item.complication).map((value) => ({ value })),
    });
    setShowForm(true);
  };

  const onSave = (values: ComplicationForm) => {
    if (!patientId) {
      Alert.alert(HY.error, HY.patientNotFound);
      return;
    }

    mutate({
      id: editing?.id,
      patient_id: editing ? String(editing.patientId) : patientId,
      date: dayjs(values.date).format("YYYY-MM-DD"),
      isActual: values.isActual ? 1 : 0,
      complicationType: values.complicationType,
      complication: JSON.stringify(
        values.complication.map(({ value }) => value.trim()),
      ),
    });
  };

  return (
    <AuthenticatedScreen contentClassName="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10 pt-3"
        keyboardShouldPersistTaps="handled"
      >
        <PatientSubHeader
          title={HY.complications}
          description={HY.selectComplications}
          icon={<ComplexityBtnIcon />}
          onBack={() => router.back()}
          right={
            <Pressable onPress={() => (showForm ? closeForm() : openCreate())}>
              <Text className="font-semibold text-sm text-calendar-primary">
                {showForm ? HY.cancel : "+"}
              </Text>
            </Pressable>
          }
        />

        {showForm ? (
          <View className="mb-4 rounded-[16px] border border-brand-100 bg-brand-50 p-3">
            <Text className="mb-2 font-semibold text-base text-grey-900">
              {HY.addComplication}
            </Text>
            <FormDateField
              control={control}
              name="date"
              rules={{ required: HY.requiredDate }}
              valueFormat="YYYY-MM-DD"
              label={HY.date}
              displayFormat="DD.MM.YYYY"
            />

            <FormSelectField
              control={control}
              name="complicationType"
              rules={{ required: HY.requiredComplication }}
              label={HY.selectComplication}
              placeholder={HY.complications}
              options={COMPLICATION_TYPES}
            />

            <Controller
              control={control}
              name="isActual"
              render={({ field: { value, onChange } }) => (
                <Pressable
                  onPress={() => onChange(!value)}
                  className="mb-3 flex-row items-center gap-2"
                >
                  <View
                    className={`h-5 w-5 items-center justify-center rounded border ${
                      value
                        ? "border-calendar-primary bg-calendar-primary"
                        : "border-brand-300 bg-white"
                    }`}
                  >
                    {value ? (
                      <Text className="text-[10px] text-white">✓</Text>
                    ) : null}
                  </View>
                  <Text className="text-sm text-grey-900">{HY.actual}</Text>
                </Pressable>
              )}
            />

            <View className="mb-2 flex-row items-center justify-between">
              <Text className="font-medium text-sm text-grey-900">
                {HY.notes}
              </Text>
              <Pressable
                disabled={fields.length >= MAX_ENTRIES}
                onPress={() => append({ value: "" })}
                className={`rounded-lg border border-calendar-primary px-3 py-1.5 ${
                  fields.length >= MAX_ENTRIES ? "opacity-40" : ""
                }`}
              >
                <Text className="font-medium text-xs text-calendar-primary">
                  + {HY.add}
                </Text>
              </Pressable>
            </View>

            {fields.map((field, index) => (
              <View key={field.id} className="flex-row items-start gap-2">
                <View className="flex-1">
                  <FormTextField
                    control={control}
                    name={`complication.${index}.value`}
                    rules={{
                      validate: (raw: string) =>
                        raw.trim().length > 0 || HY.requiredNote,
                    }}
                    placeholder={HY.note}
                    multiline
                  />
                </View>
                {fields.length > 1 ? (
                  <Pressable
                    onPress={() => remove(index)}
                    hitSlop={8}
                    className="mt-3 p-2"
                    accessibilityRole="button"
                    accessibilityLabel={HY.delete}
                  >
                    <SymbolView
                      name={{ ios: "trash", android: "delete", web: "delete" }}
                      size={16}
                      tintColor="#D4183D"
                    />
                  </Pressable>
                ) : null}
              </View>
            ))}

            <Button
              title={HY.save}
              onPress={handleSubmit(onSave)}
              loading={isPending}
            />
          </View>
        ) : null}

        {!inrComplication?.length ? (
          <Text className="text-sm text-calendar-text-secondary">
            {HY.noComplications}
          </Text>
        ) : (
          inrComplication.map((item) => (
            <Pressable
              key={item.id}
              onPress={() => openEdit(item)}
              className="mb-2 rounded-[14px] bg-red-50 p-3 active:opacity-80"
            >
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-xs text-calendar-text-muted">
                  {dayjs(item.date).format("DD.MM.YYYY")} ·{" "}
                  {item.complicationType}
                </Text>
                <View className="flex-row items-center gap-2">
                  {item.isActual === 1 ? (
                    <Text className="font-semibold text-[11px] text-calendar-danger">
                      {HY.actual}
                    </Text>
                  ) : null}
                  <SymbolView
                    name={{ ios: "pencil", android: "edit", web: "edit" }}
                    size={14}
                    tintColor="#6A4A98"
                  />
                </View>
              </View>
              {jsonParsed(item.complication).map((line, idx) => (
                <Text
                  key={`${item.id}-${idx}`}
                  className="mt-1 text-sm text-grey-900"
                >
                  {line}
                </Text>
              ))}
            </Pressable>
          ))
        )}
      </ScrollView>
    </AuthenticatedScreen>
  );
}
