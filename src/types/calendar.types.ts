export type InrRecord = {
  id: string;
  date: string;
  inrValue?: number;
  warfarinDoseMg: number;
  nextTestDate?: string;
  source: "manual" | "cycle";
  cycleId?: string;
  patientId?: string;
};

export type UpsertRecordPayload = {
  date: string;
  inrValue?: number;
  warfarinDoseMg: number;
  nextTestDate?: string;
  patientId?: string;
};
