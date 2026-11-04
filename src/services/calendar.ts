import $axios from "@/libs/axios";
import {
  InrCycleResponse,
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
  async getInrCycle(params: {
    doctor_id?: string | number;
  }): Promise<InrCycleResponse> {
    return (await $axios.get<InrCycleResponse>("inr-cycle", { params })).data;
  },
  async mutateInrCycle(data: MutateInrCycleRequestType) {
    return await $axios.post(`patients/${data?.patient_id}/inr-cycle`, data);
  },
  async deleteInrCycle({
    doctorId,
    cycleId,
  }: {
    doctorId: string;
    cycleId: string | number;
  }) {
    return await $axios.delete(`patients/${doctorId}/inr-cycle/${cycleId}`);
  },
  async mutateWarfarinDosage(data: InrWarfarinDosageRequestType) {
    return (await $axios.post("inr-result-dosage-next-date", data)).data;
  },
  async mutateWarfarinCalendar({
    patientId,
    ...data
  }: {
    patientId: string;
    id?: number;
    date: string;
    dosage: number;
  }) {
    return (
      await $axios.post(`patients/${patientId}/inr-warfarin-calendar`, data)
    ).data;
  },
};
