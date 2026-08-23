import $axios from "@/libs/axios";
import type {
  InvestigationApiResponse,
  PatientAllInrApiResponse,
  PatientInrResponse,
} from "@/types/inr-types";
import type {
  InrAdviceApiResponse,
  InrComplicationApiResponse,
} from "@/types/patient-types";

/** React Native has no `File`; document/image pickers return a uri descriptor. */
export type InrFileInput = {
  uri: string;
  name: string;
  mimeType?: string;
};

/** `id` is sent only when the entry already exists (update). */
export type InrAdviceInput = {
  id?: number;
  isActual: number;
  advice: string;
  sortOrder: number;
};

export type InrComplicationInput = {
  id?: number;
  isActual: number;
  complicationType: number | string;
  complication: string;
  sortOrder?: number;
};

export const inrNormApi = {
  async getInrInvestigations(
    params?: Record<string, string | number>,
  ): Promise<InvestigationApiResponse> {
    return (await $axios.get<InvestigationApiResponse>("inr", { params })).data;
  },

  async getPatientAllInr(
    queryParams: Record<string, string> & { patient_id: string },
  ): Promise<PatientAllInrApiResponse> {
    const { patient_id, ...params } = queryParams;
    return (
      await $axios.get<PatientAllInrApiResponse>(`patients/${patient_id}/inr`, {
        params,
      })
    ).data;
  },

  async createPatientInr(mutateData: {
    id: string;
    date: string;
    value: number | string;
    placeOfOrigin?: string;
    file?: InrFileInput;
    comment?: string;
    spravochnikId: string;
    nmmcAllExamId?: string;
    region?: string | number;
    city?: string | number;
    address?: string;
  }) {
    const { id, file, ...fields } = mutateData;
    const formData = new FormData();

    Object.entries(fields).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        formData.append(key, String(value));
      }
    });

    if (file) {
      formData.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.mimeType ?? "application/octet-stream",
      } as unknown as Blob);
    }

    return (await $axios.post(`patients/${id}/inr`, formData)).data;
  },

  async getPatientInr(queryParams: {
    patient_id: string | number;
    date: string;
  }): Promise<PatientInrResponse> {
    const { patient_id, ...params } = queryParams;
    return (
      await $axios.get<PatientInrResponse>(`patients/${patient_id}/inr-norm`, {
        params,
      })
    ).data;
  },

  async getPatientInrNorm(
    queryParams: Record<string, string>,
  ): Promise<PatientInrResponse> {
    const { patient_id, ...params } = queryParams;
    return (
      await $axios.get<PatientInrResponse>(`patients/${patient_id}/inr-norm`, {
        params,
      })
    ).data;
  },

  async updatePatientInrNorm(mutateData: {
    patient_id: string | number;
    normStart: string;
    normEnd: string;
  }) {
    const { patient_id, ...data } = mutateData;
    return (await $axios.post(`patients/${patient_id}/inr-norm`, data)).data;
  },

  async getPatientInrAdvice(
    queryParams: Record<string, string>,
  ): Promise<InrAdviceApiResponse> {
    const { patient_id, ...params } = queryParams;
    return (
      await $axios.get<InrAdviceApiResponse>(
        `patients/${patient_id}/inr-advice`,
        { params },
      )
    ).data;
  },

  async createOrUpdatePatientInrAdvice(mutateData: {
    id?: number;
    patient_id: string | number;
    date: string;
    advices: InrAdviceInput[];
  }) {
    const { patient_id, ...data } = mutateData;
    return (await $axios.post(`patients/${patient_id}/inr-advice`, data)).data;
  },

  async getPatientInrComplication(
    queryParams: Record<string, string>,
  ): Promise<InrComplicationApiResponse> {
    const { patient_id, ...params } = queryParams;
    return (
      await $axios.get<InrComplicationApiResponse>(
        `patients/${patient_id}/inr-complication`,
        { params },
      )
    ).data;
  },

  async createOrUpdateInrComplication(mutateData: {
    id?: number;
    patient_id: string;
    date: string;
    complications: InrComplicationInput[];
  }) {
    const { patient_id, ...data } = mutateData;
    return (await $axios.post(`patients/${patient_id}/inr-complication`, data))
      .data;
  },

  async deletePatientInrNorm({
    patient_id,
    inrId,
  }: {
    patient_id: string;
    inrId: number;
  }) {
    return await $axios.delete(`patients/${patient_id}/inr/${inrId}`);
  },
  async fetchInrTTR(patientId: string) {
    return (await $axios.get(`inr-ttr?patient_id=${patientId}`)).data;
  },
};
