import { PatientAvatar } from "@/components/patient/PatientAvatar";
import { HY } from "@/constants/hy";
import type { Item } from "@/types/patient-types";
import { Pressable, Text, View } from "react-native";

type PatientCardProps = {
  patient: Item;
  onPress: () => void;
};

export function PatientCard({ patient, onPress }: PatientCardProps) {
  const photo = patient.photo ?? patient.image ?? patient.avatar;
  const location = [patient.city, patient.region, patient.street]
    .filter(Boolean)
    .join(", ");
  const idText = `${HY.idLabel}: ${patient.id}`;
  const genderAgeText = `${patient.gender} . ${patient.age} ${HY.years}`;
  return (
    <Pressable
      onPress={onPress}
      className="mb-2 items-center gap-[6px] rounded-xl border border-brand-700 bg-white px-3 py-3 active:bg-brand-50"
    >
      <View className="flex-row items-start gap-2 w-full">
        <PatientAvatar photo={photo} gender={patient.gender} size={52} />
        <View className="flex-1 gap-[10px]">
          <Text
            className="font-[600]  text-grey-900 text-[12px]"
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {patient.fullName}
          </Text>
          <Text className="font-[600] self-start text-white rounded-[4px] px-[6px] py-[2px] bg-brand-700 text-[11px]">
            {idText}
          </Text>
        </View>
        <Text className="font-[600] bg-brand-200 rounded-[8px] px-2 py-1 text-brand-900 text-[10px]">
          {patient.cardType || ""}
        </Text>
      </View>
      <View className="flex-row items-center gap-2 w-full justify-between ">
        <Text className="font-[600] text-brand-500 text-[10px]">
          {HY.genderAge}
        </Text>
        <Text className="font-[600] text-grey-900 text-[10px]">
          {genderAgeText}
        </Text>
      </View>
      <View className="flex-row items-center gap-2 w-full justify-between ">
        <Text className="font-[600] text-brand-500 text-[10px]">
          {HY.address}
        </Text>
        <Text
          className="font-[600] text-grey-900 text-[10px] max-w-[60%]"
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {location}
        </Text>
      </View>
      <View className="flex-row items-center gap-2 w-full justify-between ">
        <Text className="font-[600] text-brand-500 text-[10px]">
          {HY.attendingDoctor}
        </Text>
        <Text className="font-[600] text-grey-900 text-[10px]">
          {patient.doctor}
        </Text>
      </View>
    </Pressable>
  );
}
