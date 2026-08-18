import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import { CheckmarkIcon } from "@/components/svg-components/checkmark-icon";
import { ComplexityBtnIcon } from "@/components/svg-components/complexity-icon";
import { SuccessIcon } from "@/components/svg-components/success-icon";
import { TrashIcon } from "@/components/svg-components/trash-icon";
import { Button } from "@/components/ui/Button";
import { FormDateField } from "@/components/ui/FormDateField";
import { FormSelectField } from "@/components/ui/FormSelectField";
import { FormTextField } from "@/components/ui/FormTextField";
import { SuccessModal } from "@/components/ui/SuccessModal";
import { HY } from "@/constants/hy";
import { useCreateOrUpdateInrComplication } from "@/hooks/inr-norm/useCreateOrUpdateInrComplication.hook";
import type { InrComplicationType } from "@/types/patient-types";
import { useQueryClient } from "@tanstack/react-query";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
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

const COMPLICATION_TYPES = [1, 2, 3, 4, 5].map((value) => ({
  label: String(value),
  value,
}));

type ComplicationForm = {
  date: string;
  complications: {
    id?: number;
    isActual: number;
    complicationType: number | "";
    complication: string;
  }[];
};

function parseRouteObject<T>(value?: string | string[]): T | undefined {
  const raw = Array.isArray(value) ? value[0] : value;
  if (!raw) return undefined;

  try {
    return JSON.parse(raw) as T;
  } catch {
    return undefined;
  }
}

export default function ComplicationFormScreen() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const insets = useSafeAreaInsets();
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [successOpen, setSuccessOpen] = useState(false);
  const { patientId, complication } = useLocalSearchParams<{
    patientId: string;
    complication?: string;
  }>();
  const editing = useMemo(
    () => parseRouteObject<InrComplicationType>(complication),
    [complication],
  );
  const isEditing = Boolean(editing);
  const { control, handleSubmit, reset } = useForm<ComplicationForm>({
    defaultValues: {
      date: "",
      complications: [{ isActual: 1, complicationType: "", complication: "" }],
    },
  });
  const { fields, append, remove } = useFieldArray({
    control,
    name: "complications",
  });

  useEffect(() => {
    if (!editing) return;

    reset({
      date: dayjs(editing.date).format("YYYY-MM-DD"),
      complications: editing.complications?.length
        ? editing.complications
        : [
            {
              isActual: editing.isActual ?? 1,
              complicationType: editing.complicationType ?? "",
              complication: editing.complication ?? "",
            },
          ],
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

  const { mutate, isPending } = useCreateOrUpdateInrComplication(() => {
    setSuccessOpen(true);
  });

  const onSave = (values: ComplicationForm) => {
    if (!patientId) {
      Alert.alert(HY.error, HY.patientNotFound);
      return;
    }

    mutate({
      id: editing?.id ?? undefined,
      patient_id: editing ? String(editing.patientId) : patientId,
      date: dayjs(values.date).format("YYYY-MM-DD"),
      complications: values.complications,
    });
  };

  const renderEntry = (fieldId: string, index: number) => (
    <View
      key={fieldId}
      className={index > 0 ? "mt-1 border-t border-brand-200 pt-4" : ""}
    >
      <FormSelectField
        control={control}
        name={`complications.${index}.complicationType`}
        rules={{ required: HY.requiredComplication }}
        label={HY.selectComplicationLabel}
        labelTone="secondary"
        placeholder={HY.selectFromSuggested}
        options={COMPLICATION_TYPES}
      />

      <FormTextField
        control={control}
        name={`complications.${index}.complication`}
        rules={{ required: HY.requiredNote }}
        label={HY.writeNotes}
        labelTone="secondary"
        placeholder={HY.writePlaceholder}
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

      <Controller
        control={control}
        name={`complications.${index}.isActual`}
        render={({ field: { value, onChange } }) => (
          <Pressable
            onPress={() => onChange(value === 1 ? 0 : 1)}
            className="mb-3 flex-row items-center gap-2 self-start"
            accessibilityRole="checkbox"
            accessibilityState={{ checked: value === 1 }}
          >
            <View
              className={`h-5 w-5 items-center justify-center rounded border ${
                value === 1
                  ? "border-bg-brand-900 bg-brand-900"
                  : "border-brand-300 bg-white"
              }`}
            >
              {value === 1 ? (
                <SuccessIcon color="white" width={12} height={8} />
              ) : null}
            </View>
            <Text className="text-[14px] text-grey-900">{HY.actual}</Text>
          </Pressable>
        )}
      />
    </View>
  );

  const addEntryButton =
    fields.length < MAX_ENTRIES ? (
      <Pressable
        onPress={() =>
          append({
            isActual: 1,
            complicationType: "",
            complication: "",
          })
        }
        className="self-end rounded-lg border border-brand-200 bg-brand-100 px-3 py-2 active:opacity-80"
      >
        <Text className="font-medium text-[14px] text-brand-700">
          + {HY.addAnotherComplication}
        </Text>
      </Pressable>
    ) : null;

  return (
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
            title={isEditing ? HY.editComplications : HY.addComplication}
            description={isEditing ? undefined : HY.complicationHint}
            icon={<ComplexityBtnIcon />}
            onBack={() => router.back()}
          />

          {isEditing ? (
            <View className="rounded-[12px] bg-brand-100 p-4">
              <FormDateField
                control={control}
                name="date"
                rules={{ required: HY.requiredDate }}
                valueFormat="YYYY-MM-DD"
                label={HY.selectDateLabel}
                placeholder={HY.datePlaceholder}
                maximumDate={new Date()}
                disabled
              />

              {fields.map((field, index) => renderEntry(field.id, index))}

              {addEntryButton}
            </View>
          ) : (
            <>
              <FormDateField
                control={control}
                name="date"
                rules={{ required: HY.requiredDate }}
                valueFormat="YYYY-MM-DD"
                label={HY.selectDateLabel}
                placeholder={HY.datePlaceholder}
                maximumDate={new Date()}
              />

              {fields.map((field, index) => renderEntry(field.id, index))}

              {addEntryButton}
            </>
          )}
        </ScrollView>

        <View className="gap-2 px-4 pb-2 pt-3">
          <Button
            title={HY.save}
            onPress={handleSubmit(onSave)}
            loading={isPending}
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
        title={HY.complicationsSavedSuccess}
        icon={<ComplexityBtnIcon />}
        onClose={() => {
          setSuccessOpen(false);
          void queryClient
            .invalidateQueries({
              queryKey: ["patient-inr-complication"],
              refetchType: "all",
            })
            .then(() => router.back());
        }}
      />
    </AuthenticatedScreen>
  );
}
