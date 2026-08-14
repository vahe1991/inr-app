import {
  PATIENT_SECTIONS,
  type PatientSectionKey,
} from "@/constants/patient-sections.constants";
import { Pressable, ScrollView, Text } from "react-native";

type SectionTabsProps = {
  active: PatientSectionKey;
  onChange: (key: PatientSectionKey) => void;
};

export function SectionTabs({ active, onChange }: SectionTabsProps) {
  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      className="mt-4"
      contentContainerClassName="gap-2"
    >
      {PATIENT_SECTIONS.map((section) => {
        const isActive = section.key === active;
        return (
          <Pressable
            key={section.key}
            onPress={() => onChange(section.key)}
            className={`rounded-lg px-3.5 py-2.5 ${
              isActive ? "bg-calendar-primary" : "bg-brand-50"
            }`}
          >
            <Text
              className={`font-semibold text-xs ${
                isActive ? "text-white" : "text-brand-700"
              }`}
            >
              {section.label}
            </Text>
          </Pressable>
        );
      })}
    </ScrollView>
  );
}
