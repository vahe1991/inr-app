import type { InrWarfarinCalendarItem } from "@/types/calendar-types";
import dayjs from "dayjs";

export function datesInRange(from: string, to: string) {
  const start = dayjs(from);
  const end = dayjs(to);
  const first = start.isBefore(end) ? start : end;
  const last = start.isBefore(end) ? end : start;
  const count = last.diff(first, "day") + 1;
  return Array.from({ length: count }, (_, i) =>
    first.add(i, "day").format("YYYY-MM-DD"),
  );
}

export function asCalendarItems(payload: unknown): InrWarfarinCalendarItem[] {
  if (Array.isArray(payload)) return payload;
  if (
    payload &&
    typeof payload === "object" &&
    Array.isArray((payload as { items?: unknown }).items)
  ) {
    return (payload as { items: InrWarfarinCalendarItem[] }).items;
  }
  return [];
}

export type SavedCycleDay = {
  date: string;
  dosage: number;
  id?: number;
};

export type SavedCycle = {
  id?: number;
  name: string;
  days: SavedCycleDay[];
  createdAt?: string;
};

function asCycleDays(value: unknown): SavedCycleDay[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((item) => {
      if (!item || typeof item !== "object") return null;
      const row = item as Record<string, unknown>;
      const date = String(row.date ?? "");
      const dosage = Number(row.dosage ?? row.warfarine_dosage ?? 0);
      if (!date) return null;
      return {
        date,
        dosage,
        id: typeof row.id === "number" ? row.id : undefined,
      };
    })
    .filter((item): item is SavedCycleDay => item != null);
}

function asCycle(value: unknown): SavedCycle | null {
  if (!value || typeof value !== "object") return null;
  const row = value as Record<string, unknown>;
  const days = asCycleDays(row.days);
  const name = String(row.name ?? "");
  if (!name && !days.length) return null;
  return {
    id: typeof row.id === "number" ? row.id : undefined,
    name: name || String(days.length),
    days,
    createdAt: row.created_at
      ? String(row.created_at)
      : row.createdAt
        ? String(row.createdAt)
        : undefined,
  };
}

export function asSavedCycles(payload: unknown): SavedCycle[] {
  const list = Array.isArray(payload)
    ? payload
    : payload &&
        typeof payload === "object" &&
        Array.isArray((payload as { items?: unknown }).items)
      ? (payload as { items: unknown[] }).items
      : payload &&
          typeof payload === "object" &&
          Array.isArray((payload as { data?: unknown }).data)
        ? (payload as { data: unknown[] }).data
        : [];

  return list
    .map(asCycle)
    .filter((item): item is SavedCycle => item != null);
}
