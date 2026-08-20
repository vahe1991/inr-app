import $axios from "@/libs/axios";
import {
  InrWarfarinDosageRequestType,
  MutateInrCycleRequestType,
} from "@/types/calendar-types";

export const calendarApi = {
  async getWarfarinCalendar({
    patient_id,
    ...params
  }: {
    patient_id: string;
    page?: number;
    pageSize?: number;
  }) {
    return (
      await $axios.get(`patients/${patient_id}/inr-warfarin-calendar`, {
        params,
      })
    ).data;
  },
  async deletehWarfarinCalendar({
    patient_id,
    calendarId,
  }: {
    patient_id: string;
    calendarId: string | number;
  }) {
    return await $axios.delete(`patients/${patient_id}/inr/${calendarId}`);
  },
  async getInrCycle(params: { doctor_id: string; patient_id: string }) {
    return await $axios.get("inr-cycle", { params });
  },
  async mutateInrCycle({ patient_id, ...data }: MutateInrCycleRequestType) {
    return await $axios.post(`patients/${patient_id}/inr-cycle`, data);
  },
  async mutateWarfarinDosage(data: InrWarfarinDosageRequestType) {
    return (await $axios.post("inr-result-dosage-next-date", data)).data;
  },
  async mutateWarfarinCalendar({
    patientId,
    ...data
  }: {
    patientId: string;
    data: {
      id?: number;
      date: string;
      dosage: number;
    };
  }) {
    return (
      await $axios.post(`patients/${patientId}/inr-warfarin-calendar`, data)
    ).data;
  },
};
