import { PatientAvatar } from "@/components/patient/PatientAvatar";
import { HY } from "@/constants/hy";
import type { PatientType } from "@/types/patient-types";
import { Text, View } from "react-native";

export function PatientBanner({ patient }: { patient?: PatientType }) {
  if (!patient) return null;

  const photo = patient.photo ?? patient.image ?? patient.avatar;
  const location = [patient.city, patient.region].filter(Boolean).join(", ");

  return (
    <View className="flex-row items-center gap-3 rounded-xl border border-calendar-border bg-white p-3">
      <PatientAvatar photo={photo} gender={patient.gender} size={64} />

      <View className="min-w-0 flex-1">
        <Text
          className="font-semibold text-lg text-grey-900"
          numberOfLines={2}
        >
          {patient.fullName}
        </Text>

        <Text className="mt-0.5 font-medium text-sm text-oxford-blue-200">
          #{patient.id}
          {patient.age ? ` · ${patient.age} ${HY.years}` : ""}
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

        <View className="mt-2 flex-row flex-wrap gap-1.5">
          {patient.cardType ? (
            <View className="rounded-calendar-pill bg-brand-100 px-2.5 py-0.5">
              <Text className="font-medium text-[11px] text-brand-700">
                {patient.cardType}
              </Text>
            </View>
          ) : null}
          {patient.doctor ? (
            <View className="rounded-calendar-pill bg-brand-100 px-2.5 py-0.5">
              <Text className="font-medium text-[11px] text-brand-700">
                {HY.doctor}: {patient.doctor}
              </Text>
            </View>
          ) : null}
        </View>
      </View>
    </View>
  );
}
