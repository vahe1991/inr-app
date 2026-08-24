import $axios from "@/libs/axios";

export const chatApi = {
  async getChatsMessages({
    patient_id,
    ...params
  }: {
    patient_id: string | number;
    limit: number;
  }) {
    return await $axios.get(`patients/${patient_id}/chat/messages`, { params });
  },

  async sendChatsMessage({
    patient_id,
    ...data
  }: {
    patient_id: string | number;
    content: string;
    file?: File;
  }) {
    return await $axios.post(`patients/${patient_id}/chat/messages`, data, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
  },
  async readAsChat(patient_id: string | number) {
    return await $axios.post(`patients/${patient_id}/chat/read`);
  },
  // chat inbox
  async getChatNotifications({
    limit = 20,
    offset = 0,
  }: {
    limit: number;
    offset: number;
  }) {
    return await $axios.get("chat/notifications", {
      params: { limit, offset },
    });
  },
  async getChatUnreadCount() {
    return await $axios.get("chat/unread-count");
  },
  async readAllChatNotifications() {
    return await $axios.post("chat/notifications/read-all");
  },
};
