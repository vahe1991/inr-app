import { PatientAvatar } from "@/components/patient/PatientAvatar";
import { HY } from "@/constants/hy";
import type { Item } from "@/types/patient-types";
import { SymbolView } from "expo-symbols";
import { Pressable, Text, View } from "react-native";

type PatientCardProps = {
  patient: Item;
  onPress: () => void;
};

export function PatientCard({ patient, onPress }: PatientCardProps) {
  const photo = patient.photo ?? patient.image ?? patient.avatar;
  const location = [patient.city, patient.region].filter(Boolean).join(", ");

  return (
    <Pressable
      onPress={onPress}
      className="mb-2 flex-row items-center gap-3 rounded-xl border border-calendar-border bg-white px-3 py-3 active:bg-brand-50"
    >
      <PatientAvatar photo={photo} gender={patient.gender} size={52} />

      <View className="min-w-0 flex-1">
        <View className="mb-0.5 flex-row items-center gap-2">
          <Text
            className="flex-1 font-semibold text-base text-grey-900"
            numberOfLines={1}
          >
            {patient.fullName}
          </Text>
          <View className="rounded-calendar-pill bg-brand-100 px-2 py-0.5">
            <Text className="font-medium text-[11px] text-brand-700">
              #{patient.id}
            </Text>
          </View>
        </View>

        <Text
          className="font-medium text-sm text-oxford-blue-200"
          numberOfLines={1}
        >
          {patient.age} {HY.years}
          {patient.gender ? ` · ${patient.gender}` : ""}
        </Text>

        {location ? (
          <Text
            className="mt-0.5 font-medium text-xs text-calendar-text-muted"
            numberOfLines={1}
          >
            {location}
          </Text>
        ) : null}

        {patient.doctor ? (
          <Text
            className="mt-0.5 font-medium text-xs text-calendar-text-secondary"
            numberOfLines={1}
          >
            {HY.doctor}: {patient.doctor}
          </Text>
        ) : null}
      </View>

      <SymbolView
        name={{
          ios: "chevron.right",
          android: "chevron_right",
          web: "chevron_right",
        }}
        size={18}
        tintColor="#bfbfbf"
      />
    </Pressable>
  );
}
