import $axios from "@/libs/axios";
import type {
  PatientEditType,
  PatientListResponse,
  PatientResponse,
  PatientsSearchType,
} from "@/types/patient-types";

export const patientApi = {
  async fetchPatientsList(
    params: PatientsSearchType = {},
  ): Promise<PatientListResponse> {
    return (await $axios.get<PatientListResponse>("patients", { params })).data;
  },
  async getPatientById(patient_id?: string): Promise<PatientResponse> {
    return (await $axios.get<PatientResponse>(`patients/${patient_id}`)).data;
  },
  async editPatient({
    patient_id,
    ...data
  }: PatientEditType & {
    patient_id: string;
  }): Promise<PatientEditType> {
    return (await $axios.patch<PatientEditType>(`patients/${patient_id}`, data))
      .data;
  },
};
