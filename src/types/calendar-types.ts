export interface MutateInrCycleRequestType {
  id?: number;
  doctor_id?: number | string;
  patient_id: number | string;
  name?: string;
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
  id?: number;
  patient_id: string | number;
  doctor_id: string | number;
  date: string;
  inr_result: number | string;
  warfarine_dosage: number | string;
  next_test_give_date: string;
};

export interface InrWarfarinCalendarResponse {
  data: InrWarfarinCalendarData;
}

export interface InrWarfarinCalendarData {
  items: InrWarfarinCalendarItem[];
  nextTestGiveDate: NextTestGiveDate;
  nextTestGiveDates: NextTestGiveDate[];
  meta: Meta;
}

export interface InrWarfarinCalendarItem {
  id: number;
  patientId: number;
  doctorId: number;
  date: string;
  dosage: number;
}
export interface NextTestGiveDate {
  id: number;
  patientId: number;
  doctorId: number;
  visitDate: string;
  date: string;
}
interface Meta {
  totalCount: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface InrCycleResponse {
  data: InrCycleData;
}

export interface InrCycleData {
  cycles: {
    id: number;
    doctorId: number;
    name: string;
    createdAt: string;
    days: {
      id: number;
      date: string;
      dosage: number;
    }[];
  }[];
}
