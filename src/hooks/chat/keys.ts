export const chatKeys = {
  messages: (patientId: string | number) =>
    ["chat-messages", String(patientId)] as const,
  notifications: ["chat-notifications"] as const,
  unreadCount: ["chat-unread-count"] as const,
};
