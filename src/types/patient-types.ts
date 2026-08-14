export interface Meta {
  totalCount: number;
  page: number;
  pageSize: number;
  pageCount: number;
}

export interface Item {
  id: number;
  fullName: string;
  gender: string;
  doctor: string;
  age: number;
  birthDate: string;
  country: string;
  region: string;
  city: string;
  street: string;
  occupation: string;
  cardType: string;
  photo?: string | null;
  image?: string | null;
  avatar?: string | null;
}

export interface PatientListType {
  items: Item[];
  meta: Meta;
}

export type PatientListResponse = {
  data: PatientListType;
};

export type PatientResponse = {
  data: PatientType;
  meta: Meta;
};

export interface PatientsSearchType {
  page?: number;
  pageSize?: number;
  search?: string;
}

export interface PatientType {
  id: number;
  fullName: string;
  gender: string;
  doctor: string;
  age: string;
  birthDate: string;
  country: string;
  region: string;
  city: string;
  street: string;
  occupation: string;
  cardType: string;
  photo?: string | null;
  image?: string | null;
  avatar?: string | null;
  givenName: string;
  familyName: string;
  patronymic: string;
  countryId: number;
  regionId: number;
  cityId: number;
  profession: string;
  workPlace: string;
  position: string;
  email: string;
  socialCard: string;
  socialStatus: string;
  postCode: string;
  passportSerial: string;
  doctorId: number;
  doctor2Id?: number;
  doctor3Id?: number;
  cardTypeId?: number;
  catId: number;
  childsCount?: number;
  notes: string;
  phones: {
    phone: string;
    phoneWork: string;
    email: string;
  };
  relativePhones: {
    phone: string;
    fullName: string;
    relativeType: string;
  }[];
}

export interface PatientEditType {
  givenName: string;
  familyName: string;
  patronymic: string;
  gender: string;
  birthDate: string;
  countryId: number;
  regionId: number;
  cityId: number;
  street: string;
  doctorId: number;
  cardTypeId?: number;
  cardType?: string;
  socialStatus?: string;
  age?: string;
  childsCount?: number;
  country?: string;
  region?: string;
  city?: string;
  postCode?: string;
  passportSerial?: string;
  socialCard?: string;
  workPlace?: string;
  position?: string;
  profession?: string;
  phones: {
    phone: string;
    phoneHome: string;
    email: string;
  };
  relativePhones: {
    phone: string;
    fullName: string;
    relativeType: string;
  }[];
}

export type InrAdviceType = {
  id: number;
  patientId: number | string;
  date: string;
  isActual: number;
  advice: string;
};

export type InrAdviceResponse = {
  items: InrAdviceType[];
  meta: Meta;
};

export type InrAdviceApiResponse = {
  data: InrAdviceResponse;
};

export type InrComplicationType = {
  id: number;
  patientId: number;
  date: string;
  isActual: number;
  complicationType: number;
  complication: string;
};

export type InrComplicationResponse = {
  items: InrComplicationType[];
  meta: Meta;
};

export type InrComplicationApiResponse = {
  data: InrComplicationResponse;
};
