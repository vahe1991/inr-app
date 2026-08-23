import $axios from "@/libs/axios";
import { NotificationRequestType } from "@/types/notification-type.js";

export const notificationApi = {
  async registerDevice(data: { token: string; platform: "android" | "ios" }) {
    return await $axios.post("notification/register-device", data);
  },
  async unregisterDevice(data: { token: string }) {
    return await $axios.post("notification/unregister-device", data);
  },
  async readNotification(data: { id: string | number }) {
    return await $axios.post("notification/read", data);
  },
  async readAllNotifications() {
    return await $axios.post("notification/read-all");
  },
  async getNotifications({
    is_read = false,
    limit = 5000,
    offset = 0,
  }: NotificationRequestType = {}) {
    return await $axios.get("notification", {
      params: { is_read, limit, offset },
    });
  },
  async getUnreadCount() {
    return await $axios.get("notifications/unread-count");
  },
  async deleteNotification(id: string | number) {
    return await $axios.delete(`notifications?id=${id}`);
  },
};
