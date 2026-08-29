import { clearStoredSession } from "@/libs/session";
import $axios from "@/libs/axios";
import { storage } from "@/libs/storage";
import { notificationApi } from "@/services/notification";
import { getDevicePushToken } from "@/services/push-notifications";
import { Platform } from "react-native";

export async function unregisterPushDevice() {
  if (Platform.OS !== "android" && Platform.OS !== "ios") return;

  const token = await getDevicePushToken();
  if (!token) return;

  await notificationApi.unregisterDevice({ token });
}

export async function clearClientSession(options?: {
  remote?: () => Promise<unknown>;
  forgetRememberedEmail?: boolean;
}) {
  try {
    await unregisterPushDevice();
  } catch {
    /* token may already be invalid */
  }

  try {
    await options?.remote?.();
  } catch {
    /* still drop the local session */
  }

  delete $axios.defaults.headers.common.Authorization;
  await clearStoredSession();
  if (options?.forgetRememberedEmail) {
    await storage.clearRememberedEmail();
  }
}
