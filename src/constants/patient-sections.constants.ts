export const PATIENT_SECTIONS = [
  { key: "demographic", label: "Դեմոգրաֆիկ" },
  { key: "inr", label: "INR" },
  { key: "calendar", label: "Օրացույց" },
  { key: "lab", label: "Լաբորատոր" },
] as const;

export type PatientSectionKey = (typeof PATIENT_SECTIONS)[number]["key"];

export const DEFAULT_PATIENT_SECTION: PatientSectionKey = "demographic";

export function isPatientSectionKey(
  value: string | undefined,
): value is PatientSectionKey {
  return PATIENT_SECTIONS.some((section) => section.key === value);
}
