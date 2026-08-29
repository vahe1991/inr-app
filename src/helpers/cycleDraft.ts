import type { SavedCycleDay } from "@/helpers/calendarItems";

export type CycleDraft = {
  action: "apply" | "edit";
  days: SavedCycleDay[];
  name?: string;
  cycleId?: number;
};

let draft: CycleDraft | null = null;

export function setCycleDraft(next: CycleDraft) {
  draft = next;
}

export function peekCycleDraft() {
  return draft;
}

export function clearCycleDraft() {
  draft = null;
}
