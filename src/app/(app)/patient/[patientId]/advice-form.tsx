import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import { PermissionGate } from "@/components/permission/PermissionGate";
import { AdviceBtnIcon } from "@/components/svg-components/advice-icon";
import { CheckmarkIcon } from "@/components/svg-components/checkmark-icon";
import { SuccessIcon } from "@/components/svg-components/success-icon";
import { TrashIcon } from "@/components/svg-components/trash-icon";
import { Button } from "@/components/ui/Button";
import { FormDateField } from "@/components/ui/FormDateField";
import { FormTextField } from "@/components/ui/FormTextField";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { HY } from "@/constants/hy";
import { ApiPaths } from "@/constants/apiPaths";
import { jsonParsed } from "@/helpers/jsonParsed";
import { useCreateOrUpdatePatientAdvice } from "@/hooks/inr-norm/useCreateOrUpdateInrAdvice.hook";
import { useGetPatentInrAdvice } from "@/hooks/inr-norm/useGetPatentInrAdvice.hook";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
  type KeyboardEvent,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

const MAX_ENTRIES = 3;

type AdviceForm = {
  date: string;
  isActual: boolean;
  advice: { id?: number; value: string }[];
};

export default function AdviceFormScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [successOpen, setSuccessOpen] = useState(false);
  const { patientId, adviceId } = useLocalSearchParams<{
    patientId: string;
    adviceId?: string;
  }>();
  const isEditing = Boolean(adviceId);

  const { inrAdvice, isLoadingAdvice } = useGetPatentInrAdvice({
    patient_id: patientId ?? "",
    page: "1",
    pageSize: "20",
  });
  const editing = adviceId
    ? inrAdvice?.find((item) => String(item.id) === adviceId)
    : undefined;

  const { control, handleSubmit, reset, watch } = useForm<AdviceForm>({
    defaultValues: {
      date: dayjs().format("YYYY-MM-DD"),
      isActual: true,
      advice: [{ value: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({ control, name: "advice" });

  useEffect(() => {
    if (!editing) return;

    const entries = editing.advices?.length
      ? editing.advices.map(({ id, advice }) => ({ id, value: advice }))
      : jsonParsed(editing.advice ?? "").map((value) => ({ value }));

    reset({
      date: dayjs(editing.date).format("YYYY-MM-DD"),
      isActual: editing.advices?.length
        ? editing.advices.some((entry) => entry.isActual === 1)
        : editing.isActual === 1,
      advice: entries,
    });
  }, [editing, reset]);

  useEffect(() => {
    const showEvent =
      Platform.OS === "ios" ? "keyboardWillShow" : "keyboardDidShow";
    const hideEvent =
      Platform.OS === "ios" ? "keyboardWillHide" : "keyboardDidHide";

    const onShow = (event: KeyboardEvent) => {
      setKeyboardHeight(
        Math.max(event.endCoordinates.height - insets.bottom, 0),
      );
    };
    const onHide = () => setKeyboardHeight(0);

    const showSub = Keyboard.addListener(showEvent, onShow);
    const hideSub = Keyboard.addListener(hideEvent, onHide);

    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, [insets.bottom]);

  const { mutate, isPending } = useCreateOrUpdatePatientAdvice(() => {
    setSuccessOpen(true);
  });

  const entries = watch("advice");
  const isFilled =
    entries?.length > 0 && entries.every(({ value }) => value.trim().length);

  const onSave = (values: AdviceForm) => {
    if (!patientId) {
      Alert.alert(HY.error, HY.patientNotFound);
      return;
    }

    mutate({
      id: editing?.id,
      patient_id: editing ? editing.patientId : patientId,
      date: dayjs(values.date).format("YYYY-MM-DD"),
      advices: values.advice.map(({ id, value }, index) => ({
        ...(id ? { id } : null),
        isActual: isEditing ? (values.isActual ? 1 : 0) : 1,
        advice: value.trim(),
        sortOrder: isEditing ? index : 1,
      })),
    });
  };

  if (isEditing && isLoadingAdvice) return <LoadingScreen />;

  return (
    <PermissionGate
      method="POST"
      path={ApiPaths.patientInrAdvice(patientId ?? "{patientId}")}
    >
    <AuthenticatedScreen contentClassName="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pt-3"
          contentContainerStyle={{
            paddingBottom:
              16 + (Platform.OS === "android" ? keyboardHeight : 0),
          }}
          keyboardShouldPersistTaps="handled"
          automaticallyAdjustKeyboardInsets
          showsVerticalScrollIndicator={false}
        >
          <PatientSubHeader
            title={HY.addAdvice}
            description={HY.adviceActualHint}
            icon={<AdviceBtnIcon />}
            onBack={() => router.back()}
          />

          <FormDateField
            control={control}
            name="date"
            rules={{ required: HY.requiredDate }}
            valueFormat="YYYY-MM-DD"
            label={HY.selectDateLabel}
            maximumDate={new Date()}
          />

          {fields.map((field, index) => (
            <FormTextField
              key={field.id}
              control={control}
              name={`advice.${index}.value`}
              label={index === 0 ? HY.writeAdvice : undefined}
              labelTone="secondary"
              placeholder={HY.adviceSingle}
              multiline
              rightAccessory={
                fields.length > 1 ? (
                  <Pressable
                    onPress={() => remove(index)}
                    hitSlop={8}
                    className="self-end pl-3 active:opacity-70"
                    accessibilityRole="button"
                    accessibilityLabel={HY.delete}
                  >
                    <TrashIcon width={18} height={18} />
                  </Pressable>
                ) : null
              }
            />
          ))}

          {isFilled && fields.length < MAX_ENTRIES ? (
            <Pressable
              onPress={() => append({ value: "" })}
              className="self-end rounded-lg border border-brand-200 bg-brand-100 px-3 py-2 active:opacity-80"
            >
              <Text className="font-medium text-[14px] text-brand-700">
                + {HY.addNewAdvice}
              </Text>
            </Pressable>
          ) : null}

          {isEditing ? (
            <Controller
              control={control}
              name="isActual"
              render={({ field: { value, onChange } }) => (
                <Pressable
                  onPress={() => onChange(!value)}
                  className="mt-5 flex-row items-center gap-2 self-start"
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: value }}
                >
                  <View
                    className={`h-5 w-5 items-center justify-center rounded border ${
                      value
                        ? "border-bg-brand-900 bg-brand-900"
                        : "border-brand-300 bg-white"
                    }`}
                  >
                    {value ? (
                      <SuccessIcon color="white" width={12} height={8} />
                    ) : null}
                  </View>
                  <Text className="text-[14px] text-grey-900">{HY.actual}</Text>
                </Pressable>
              )}
            />
          ) : null}
        </ScrollView>

        <View className="gap-2 px-4 pb-2 pt-3">
          <Button
            title={HY.save}
            onPress={handleSubmit(onSave)}
            loading={isPending}
            disabled={!isFilled}
            icon={(color) => <CheckmarkIcon color={color} />}
          />
          <Button
            title={HY.cancel}
            variant="outline"
            onPress={() => router.back()}
          />
        </View>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={successOpen}
        title={HY.adviceSavedSuccess}
        icon={<AdviceBtnIcon />}
        onClose={() => {
          setSuccessOpen(false);
          void queryClient
            .invalidateQueries({
              queryKey: ["patient-inr-advice"],
              refetchType: "all",
            })
            .then(() => router.back());
        }}
      />
    </AuthenticatedScreen>
    </PermissionGate>
  );
}
