import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { HY } from "@/constants/hy";
import { jsonParsed } from "@/helpers/jsonParsed";
import { usePatientInrAdvice } from "@/hooks/usePatientInr";
import { useCreateOrUpdatePatientAdvice } from "@/hooks/usePatientInrMutations";
import dayjs from "dayjs";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import { Alert, Pressable, ScrollView, Text, View } from "react-native";

export default function AdviceScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { items, isLoading } = usePatientInrAdvice(patientId);
  const [showForm, setShowForm] = useState(false);
  const [date, setDate] = useState(dayjs().format("YYYY-MM-DD"));
  const [advice, setAdvice] = useState("");
  const [isActual, setIsActual] = useState(true);

  const { mutate, isPending } = useCreateOrUpdatePatientAdvice(() => {
    Alert.alert(HY.saved, HY.advice);
    setShowForm(false);
    setAdvice("");
  });

  if (isLoading) return <LoadingScreen />;

  const onSave = () => {
    if (!patientId || !advice.trim()) {
      Alert.alert(HY.brand, HY.addAdvice);
      return;
    }
    mutate({
      patient_id: patientId,
      date,
      isActual: isActual ? 1 : 0,
      advice: JSON.stringify([advice.trim()]),
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
          title={HY.advice}
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
              {HY.addAdvice}
            </Text>
            <TextField
              label={HY.date}
              value={date}
              onChangeText={setDate}
              placeholder="YYYY-MM-DD"
            />
            <TextField
              label={HY.advice}
              value={advice}
              onChangeText={setAdvice}
              placeholder={HY.advice}
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
            {HY.noAdvice}
          </Text>
        ) : (
          items.map((item) => (
            <View key={item.id} className="mb-2 rounded-[14px] bg-brand-100 p-3">
              <View className="mb-1 flex-row items-center justify-between">
                <Text className="text-xs text-calendar-text-muted">
                  {dayjs(item.date).format("DD.MM.YYYY")}
                </Text>
                {item.isActual === 1 ? (
                  <Text className="font-semibold text-[11px] text-calendar-primary">
                    {HY.actual}
                  </Text>
                ) : null}
              </View>
              {jsonParsed(item.advice).map((line, idx) => (
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
