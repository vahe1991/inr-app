export interface MutateInrCycleRequestType {
  id?: number;
  doctor_id: number;
  patient_id: number;
  name: string;
  days: {
    date: string;
    dosage: number;
    id?: number;
  }[];
}
export type InrWarfarinDosageResponse = {
  data: InrWarfarinDosageRequestType;
};

export type InrWarfarinDosageRequestType = {
  id: number;
  patient_id: string;
  doctor_id: string;
  date: string;
  inr_result: number;
  warfarine_dosage: number;
  next_test_give_date: string;
};

export interface InrWarfarinCalendarResponse {
  data: InrWarfarinCalendarData;
}

export interface InrWarfarinCalendarData {
  items: InrWarfarinCalendarItem[];
  meta: Meta;
}

export interface InrWarfarinCalendarItem {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  dosage: number;
}

interface Meta {
  totalCount: number;
  page: number;
  pageSize: number;
  pageCount: number;
}
