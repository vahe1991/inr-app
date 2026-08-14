export interface PatientInrType {
  id: string | number;
  patientId: number;
  normStart: number;
  normEnd: number;
  activeFromDate: string;
  activeToDate: string | null;
}

export type PatientInrResponse = {
  data: PatientInrType;
};

export interface InrType {
  id: number;
  allExaminationId: number;
  patientId: number;
  value: number;
  date: string;
  comment: string;
  nmmcAllExamId?: string | number;
  spravochnikId: number;
  spravochnikRowId: number;
  status: number;
}

export interface Meta {
  totalCount: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export type PatientAllInrType = {
  items: InrType[];
  meta: Meta;
};

export type PatientAllInrApiResponse = {
  data: PatientAllInrType;
};

export interface InvestigationType {
  id: number;
  allExaminationId: number;
  patientId: number;
  value: number;
  date: string;
  region: string;
  city: string;
  address: string;
  comment: string;
  filePath: string;
  nmmcAllExamId?: string | number;
  spravochnikId: number;
  spravochnikRowId: number;
  status: number;
  patient: {
    id: number;
    fullName: string;
  };
}

export type InrInvestigationType = {
  items: InvestigationType[];
  meta: Meta;
};

export type InvestigationApiResponse = {
  data: InrInvestigationType;
};
