import { notificationApi } from "@/services/notification";
import { registerForPushNotifications } from "@/services/push-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

let lastRegisteredToken: string | null = null;
let inFlight: Promise<void> | null = null;

async function syncDeviceToken() {
  if (inFlight) return inFlight;

  inFlight = (async () => {
    const token = await registerForPushNotifications();
    if (!token || lastRegisteredToken === token) return;

    await notificationApi.registerDevice({
      token,
      platform: Platform.OS === "ios" ? "ios" : "android",
    });
    lastRegisteredToken = token;
  })()
    .catch((error) => {
      if (__DEV__) {
        console.warn("registerDevice failed", error);
      }
    })
    .finally(() => {
      inFlight = null;
    });

  return inFlight;
}

export function usePushNotifications(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (Platform.OS !== "android" && Platform.OS !== "ios") return;

    void syncDeviceToken();
  }, [enabled]);
}
