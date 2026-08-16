import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import { HeartBtnIcon } from "@/components/svg-components/heart-btn-icon";
import { Button } from "@/components/ui/Button";
import { FormDateField } from "@/components/ui/FormDateField";
import { FormSelectField } from "@/components/ui/FormSelectField";
import { FormTextField } from "@/components/ui/FormTextField";
import { HY } from "@/constants/hy";
import { INRAppRoutes } from "@/constants/routes.constants";
import { useCreatePatientInr } from "@/hooks/inr-norm/useCreatePatientInr.hook";
import { useLocations } from "@/hooks/useLocations.hook";
import type { InrFileInput } from "@/services/inr-norm";
import dayjs from "dayjs";
import * as DocumentPicker from "expo-document-picker";
import { useLocalSearchParams, useRouter } from "expo-router";
import { SymbolView } from "expo-symbols";
import { useMemo } from "react";
import { Controller, useForm } from "react-hook-form";
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  Text,
  View,
} from "react-native";

type NewInrForm = {
  date: Date;
  value: string;
  region?: number;
  city?: number;
  address?: string;
  file?: InrFileInput;
  comment?: string;
};

export default function NewInrScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();

  const { locations } = useLocations();

  const { control, handleSubmit, setValue, watch, formState } =
    useForm<NewInrForm>({
      mode: "onChange",
      defaultValues: { date: new Date(), value: "" },
    });

  const { mutate: createPatientInr, isPending } = useCreatePatientInr(() => {
    router.replace(
      `${INRAppRoutes.patientHistory(patientId ?? "")}?created=1`,
    );
  });

  const regions = useMemo(
    () =>
      locations
        ?.find(({ id, name }) => id === 1 || name === "ՀՀ")
        ?.regions?.map(({ id, name, cities }) => ({
          label: name,
          value: id,
          cities,
        })) ?? [],
    [locations],
  );

  const selectedRegion = watch("region");
  const cities = useMemo(
    () =>
      regions
        .find((region) => region.value === selectedRegion)
        ?.cities?.map((city) => ({ label: city.name, value: city.id })) ?? [],
    [regions, selectedRegion],
  );

  const onSave = (values: NewInrForm) => {
    if (!patientId) {
      Alert.alert(HY.error, HY.patientNotFound);
      return;
    }

    createPatientInr({
      id: patientId,
      value: values.value,
      date: dayjs(values.date).format("YYYY-MM-DD"),
      region: values.region,
      city: values.city,
      address: values.address?.trim() || undefined,
      comment: values.comment?.trim() || undefined,
      nmmcAllExamId: undefined,
      spravochnikId: "1889",
      file: values.file,
    });
  };

  const pickFile = async (onChange: (file?: InrFileInput) => void) => {
    const result = await DocumentPicker.getDocumentAsync({
      type: ["application/pdf", "image/*"],
      copyToCacheDirectory: true,
    });
    if (result.canceled) return;

    const asset = result.assets?.[0];
    if (!asset) return;

    onChange({
      uri: asset.uri,
      name: asset.name,
      mimeType: asset.mimeType,
    });
  };

  return (
    <AuthenticatedScreen contentClassName="flex-1">
      <KeyboardAvoidingView
        className="flex-1"
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          className="flex-1"
          contentContainerClassName="px-4 pb-6 pt-2"
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <PatientSubHeader
            title={HY.newInrResult}
            description={HY.enterInrResults}
            icon={<HeartBtnIcon />}
            onBack={() => router.back()}
          />

          <View className="gap-3">
            <FormDateField
              control={control}
              name="date"
              rules={{ required: HY.requiredDate }}
              label={HY.selectExamDate}
              maximumDate={new Date()}
            />

            <FormTextField
              control={control}
              name="value"
              rules={{
                required: HY.requiredInrValue,
                validate: (raw) =>
                  (Boolean(raw) && Number(raw) > 0) || HY.invalidInr,
              }}
              label={HY.enterInrValue}
              placeholder="0.0"
              keyboardType="decimal-pad"
            />

            <View>
              <Text className="mb-2 px-2 font-medium text-[14px] leading-5 text-grey-500">
                {HY.placeOfSubmission}
              </Text>
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <FormSelectField
                    control={control}
                    name="region"
                    placeholder={HY.region}
                    options={regions}
                    onValueChange={() => {
                      setValue("city", undefined);
                      setValue("address", undefined);
                    }}
                  />
                </View>
                <View className="flex-1">
                  <FormSelectField
                    control={control}
                    name="city"
                    placeholder={HY.city}
                    options={cities}
                    disabled={!cities.length}
                  />
                </View>
              </View>
              <FormTextField
                control={control}
                name="address"
                label={HY.address}
                placeholder={HY.address}
              />
            </View>

            <Controller
              control={control}
              name="file"
              render={({ field: { value, onChange } }) => (
                <View className="mb-1">
                  <Text className="mb-2 px-2 font-medium text-[14px] leading-5 text-grey-500">
                    {HY.attachDocuments}
                  </Text>
                  <Pressable
                    onPress={() => void pickFile(onChange)}
                    className="h-[102px] items-center justify-center rounded-lg border-[1.6px] border-dashed border-brand-20 bg-brand-10 px-4 active:opacity-80"
                  >
                    <SymbolView
                      name={{
                        ios: "arrow.up.doc",
                        android: "upload_file",
                        web: "upload_file",
                      }}
                      size={24}
                      tintColor="#6A4A98"
                    />
                    <Text
                      className="mt-1 text-[14px] leading-[22px] text-[#262626]"
                      numberOfLines={1}
                    >
                      {value?.name ?? HY.uploadFile}
                    </Text>
                    <Text className="mt-0.5 text-center font-medium text-[12px] leading-[18px] text-grey-400">
                      {HY.uploadHint}
                    </Text>
                  </Pressable>
                  {value ? (
                    <Pressable
                      onPress={() => onChange(undefined)}
                      className="mt-2 self-end px-2 py-1"
                    >
                      <Text className="font-medium text-[12px] text-calendar-danger">
                        {HY.delete}
                      </Text>
                    </Pressable>
                  ) : null}
                </View>
              )}
            />

            <FormTextField
              control={control}
              name="comment"
              label={HY.note}
              placeholder={HY.enterNote}
              multiline
            />

            <Button
              title={HY.save}
              onPress={handleSubmit(onSave)}
              loading={isPending}
              disabled={!formState.isValid}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </AuthenticatedScreen>
  );
}
