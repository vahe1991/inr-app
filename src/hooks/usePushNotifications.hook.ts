import { notificationApi } from "@/services/notification";
import { registerForPushNotifications } from "@/services/push-notifications";
import { useEffect } from "react";
import { Platform } from "react-native";

export function usePushNotifications(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    if (Platform.OS !== "android" && Platform.OS !== "ios") return;

    void (async () => {
      const token = await registerForPushNotifications();
      if (!token) return;

      try {
        await notificationApi.registerDevice({
          token,
          platform: Platform.OS,
        });
      } catch (error) {
        if (__DEV__) {
          console.warn("registerDevice failed", error);
        }
      }
    })();
  }, [enabled]);
}
