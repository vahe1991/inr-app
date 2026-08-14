import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { HY } from "@/constants/hy";
import { jsonParsed } from "@/helpers/jsonParsed";
import { usePatientInrComplication } from "@/hooks/usePatientInr";
import { useCreateOrUpdateInrComplication } from "@/hooks/usePatientInrMutations";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

const TYPES = ["1", "2", "3", "4", "5"];

export default function ComplicationsScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { items, isLoading } = usePatientInrComplication(patientId);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [note, setNote] = useState("");
  const [complicationType, setComplicationType] = useState("1");
  const [isActual, setIsActual] = useState(true);

  const { mutate, isPending } = useCreateOrUpdateInrComplication(() => {
    Alert.alert(HY.saved, HY.complications);
    setShowForm(false);
    setNote("");
  });

  if (isLoading) return <LoadingScreen />;

  const onSave = () => {
    if (!patientId || !note.trim()) {
      Alert.alert(HY.brand, HY.addComplication);
      return;
    }
    mutate({
      patient_id: patientId,
      date,
      isActual: isActual ? 1 : 0,
      complicationType,
      complication: JSON.stringify([note.trim()]),
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
          onBack={() => router.back()}
          right={
            <Pressable onPress={() => setShowForm((v) => !v)}>
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
            <TextField
              label={HY.date}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />
            <Text className="mb-1.5 font-medium text-sm text-brand-700">
              {HY.selectComplication}
            </Text>
            <View className="mb-3 flex-row flex-wrap gap-2">
              {TYPES.map((type) => (
                <Pressable
                  key={type}
                  onPress={() => setComplicationType(type)}
                  className={`h-10 min-w-10 items-center justify-center rounded-lg px-3 ${
                    complicationType === type
                      ? "bg-calendar-primary"
                      : "bg-white border border-brand-200"
                  }`}
                >
                  <Text
                    className={`font-semibold ${
                      complicationType === type ? "text-white" : "text-grey-900"
                    }`}
                  >
                    {type}
                  </Text>
                </Pressable>
              ))}
            </View>
            <TextField
              label={HY.notes}
              value={note}
              onChangeText={setNote}
              placeholder={HY.notes}
              multiline
            />
            <Pressable
              onPress={() => setIsActual((v) => !v)}
              className="mb-3 flex-row items-center gap-2"
            >
              <View
                className={`h-5 w-5 items-center justify-center rounded border ${
                  isActual
                    ? "border-calendar-primary bg-calendar-primary"
                    : "border-brand-300 bg-white"
                }`}
              >
                {isActual ? (
                  <Text className="text-[10px] text-white">✓</Text>
                ) : null}
              </View>
              <Text className="text-sm text-grey-900">{HY.actual}</Text>
            </Pressable>
            <Button title={HY.save} onPress={onSave} loading={isPending} />
          </View>
        ) : null}

        {items.length === 0 ? (
          <Text className="text-sm text-calendar-text-secondary">
            {HY.noComplications}
          </Text>
        ) : (
          items.map((item) => (
            <View key={item.id} className="mb-2 rounded-[14px] bg-red-50 p-3">
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-xs text-calendar-text-muted">
                  {dayjs(item.date).format("DD.MM.YYYY")} · #{item.complicationType}
                </Text>
                {item.isActual === 1 ? (
                  <Text className="font-semibold text-[11px] text-calendar-danger">
                    {HY.actual}
                  </Text>
                ) : null}
              </View>
              {jsonParsed(item.complication).map((line, idx) => (
                <Text key={`${item.id}-${idx}`} className="mt-1 text-sm text-grey-900">
                  {line}
                </Text>
              ))}
            </View>
          ))
        )}
      </ScrollView>
    </AuthenticatedScreen>
  );
}
