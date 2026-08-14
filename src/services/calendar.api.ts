import type { InrRecord, UpsertRecordPayload } from "@/types/calendar.types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "inr-calendar-data";

type StorageData = {
  records: InrRecord[];
};

async function loadData(): Promise<StorageData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as StorageData;
  } catch {
    /* defaults */
  }
  return { records: [] };
}

async function saveData(data: StorageData) {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

function generateId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

export const calendarApi = {
  async getRecords(from: string, to: string, patientId?: string) {
    const data = await loadData();
    return data.records.filter(
      (r) =>
        r.date >= from &&
        r.date <= to &&
        (!patientId || !r.patientId || r.patientId === patientId),
    );
  },

  async getRecord(date: string, patientId?: string) {
    const data = await loadData();
    return (
      data.records.find(
        (r) =>
          r.date === date &&
          (!patientId || !r.patientId || r.patientId === patientId),
      ) ?? null
    );
  },

  async upsertRecord(payload: UpsertRecordPayload): Promise<InrRecord> {
    const data = await loadData();
    const existingIndex = data.records.findIndex(
      (r) =>
        r.date === payload.date &&
        (!payload.patientId ||
          !r.patientId ||
          r.patientId === payload.patientId),
    );

    const next: InrRecord = {
      id:
        existingIndex >= 0 ? data.records[existingIndex].id : generateId(),
      date: payload.date,
      inrValue: payload.inrValue,
      warfarinDoseMg: payload.warfarinDoseMg,
      nextTestDate: payload.nextTestDate,
      source: "manual",
      patientId: payload.patientId,
    };

    if (existingIndex >= 0) {
      data.records[existingIndex] = next;
    } else {
      data.records.push(next);
    }

    await saveData(data);
    return next;
  },
};
