import { AuthenticatedScreen } from "@/components/layout/AuthenticatedScreen";
import { PatientSubHeader } from "@/components/patient/PatientSubHeader";
import { Button } from "@/components/ui/Button";
import { TextField } from "@/components/ui/TextField";
import { LoadingScreen } from "@/components/ui/LoadingScreen";
import { HY } from "@/constants/hy";
import { usePatientInrNorm } from "@/hooks/usePatientInr";
import { useUpdatePatientInrNorm } from "@/hooks/usePatientInrMutations";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { Alert, ScrollView, View } from "react-native";

export default function EditNormScreen() {
  const router = useRouter();
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const { norm, isLoading } = usePatientInrNorm(patientId);
  const [normStart, setNormStart] = useState("");
  const [normEnd, setNormEnd] = useState("");

  const { mutate, isPending } = useUpdatePatientInrNorm(() => {
    Alert.alert(HY.saved, HY.editInrNorm);
    router.back();
  });

  useEffect(() => {
    if (norm) {
      setNormStart(String(norm.normStart ?? ""));
      setNormEnd(String(norm.normEnd ?? ""));
    }
  }, [norm]);

  if (isLoading) return <LoadingScreen />;

  const onSave = () => {
    const start = Number(normStart);
    const end = Number(normEnd);
    if (!patientId || Number.isNaN(start) || Number.isNaN(end) || start >= end) {
      Alert.alert(HY.brand, HY.invalidNorm);
      return;
    }
    mutate({
      patient_id: patientId,
      normStart: String(start),
      normEnd: String(end),
    });
  };

  return (
    <AuthenticatedScreen contentClassName="flex-1">
      <ScrollView
        className="flex-1"
        contentContainerClassName="px-4 pb-10 pt-3"
        keyboardShouldPersistTaps="handled"
      >
        <PatientSubHeader title={HY.editInrNorm} onBack={() => router.back()} />
        <View className="mb-4 flex-row items-end gap-3">
          <View className="flex-1">
            <TextField
              label={HY.normStart}
              value={normStart}
              onChangeText={setNormStart}
              keyboardType="decimal-pad"
              placeholder="00.00"
            />
          </View>
          <View className="flex-1">
            <TextField
              label={HY.normEnd}
              value={normEnd}
              onChangeText={setNormEnd}
              keyboardType="decimal-pad"
              placeholder="00.00"
            />
          </View>
        </View>
        <Button title={HY.save} onPress={onSave} loading={isPending} />
      </ScrollView>
    </AuthenticatedScreen>
  );
}
