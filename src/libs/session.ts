import { queryClient } from "@/libs/queryClient";
import { storage } from "@/libs/storage";

type SessionClearedListener = () => void;

let sessionClearedListener: SessionClearedListener | null = null;

export function subscribeStoredSessionCleared(listener: SessionClearedListener) {
  sessionClearedListener = listener;
  return () => {
    if (sessionClearedListener === listener) {
      sessionClearedListener = null;
    }
  };
}

export async function clearStoredSession() {
  await storage.clear();
  queryClient.clear();
  sessionClearedListener?.();
}
