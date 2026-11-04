import * as Device from "expo-device";
import * as Notifications from "expo-notifications";
import { Platform } from "react-native";

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldPlaySound: true,
    shouldSetBadge: true,
    shouldShowBanner: true,
    shouldShowList: true,
  }),
});

export async function getDevicePushToken(): Promise<string | null> {
  if (Platform.OS === "web") return null;

  try {
    const token = await Notifications.getDevicePushTokenAsync();
    return typeof token.data === "string" ? token.data : null;
  } catch (error) {
    if (__DEV__) {
      console.warn("getDevicePushTokenAsync failed", error);
    }
    return null;
  }
}

export async function registerForPushNotifications(): Promise<string | null> {
  if (Platform.OS === "web") return null;

  if (!Device.isDevice) {
    if (__DEV__) {
      console.warn("Push notifications require a physical device");
    }
    return null;
  }

  if (Platform.OS === "android") {
    await Notifications.setNotificationChannelAsync("default", {
      name: "default",
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: "#5d4081",
    });
  }

  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let status = existingStatus;
  if (existingStatus !== "granted") {
    const requested = await Notifications.requestPermissionsAsync();
    status = requested.status;
  }
  if (status !== "granted") {
    if (__DEV__) {
      console.warn("Notification permission not granted");
    }
    return null;
  }

  const token = await getDevicePushToken();
  if (!token && __DEV__) {
    console.warn(
      "FCM/APNs token unavailable. Rebuild the native app after google-services.json / GoogleService-Info.plist changes.",
    );
  }
  return token;
}
