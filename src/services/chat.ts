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
    content,
    file,
  }: {
    patient_id: string | number;
    content: string;
    file?: { uri: string; name: string; type: string };
  }) {
    const form = new FormData();
    form.append("content", content);
    if (file?.uri) {
      form.append("file", {
        uri: file.uri,
        name: file.name,
        type: file.type,
      } as never);
    }
    return await $axios.post(`patients/${patient_id}/chat/messages`, form);
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
