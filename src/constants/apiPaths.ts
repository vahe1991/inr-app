export const ApiPaths = {
  chatNotifications: "api/chat/notifications",
  chatNotificationsReadAll: "api/chat/notifications/read-all",
  chatUnreadCount: "api/chat/unread-count",
  devicesRegister: "api/devices/register",
  devicesUnregister: "api/devices/unregister",
  doctors: "api/doctors",
  inr: "api/inr",
  inrCycle: "api/inr-cycle",
  inrResultDosageNextDate: "api/inr-result-dosage-next-date",
  inrTtr: "api/inr-ttr",
  locations: "api/locations",
  logout: "api/logout",
  me: "api/me",
  notifications: "api/notifications",
  notificationsRead: "api/notifications/read",
  notificationsReadAll: "api/notifications/read-all",
  notificationsUnreadCount: "api/notifications/unread-count",
  notificationItem: (id: string | number = "{id}") =>
    `api/notifications/${id}`,
  patients: "api/patients",
  patient: (id: string | number = "{id}") => `api/patients/${id}`,
  patientChatMessages: (patientId: string | number = "{patientId}") =>
    `api/patients/${patientId}/chat/messages`,
  patientChatMessagesUpload: (patientId: string | number = "{patientId}") =>
    `api/patients/${patientId}/chat/messages/upload`,
  patientChatRead: (patientId: string | number = "{patientId}") =>
    `api/patients/${patientId}/chat/read`,
  patientInr: (patientId: string | number = "{patientId}") =>
    `api/patients/${patientId}/inr`,
  patientInrItem: (
    patientId: string | number = "{patientId}",
    id: string | number = "{id}",
  ) => `api/patients/${patientId}/inr/${id}`,
  patientInrAdvice: (patientId: string | number = "{patientId}") =>
    `api/patients/${patientId}/inr-advice`,
  patientInrComplication: (patientId: string | number = "{patientId}") =>
    `api/patients/${patientId}/inr-complication`,
  patientInrCycle: (patientId: string | number = "{patientId}") =>
    `api/patients/${patientId}/inr-cycle`,
  patientInrNorm: (patientId: string | number = "{patientId}") =>
    `api/patients/${patientId}/inr-norm`,
  patientWarfarinCalendar: (patientId: string | number = "{patientId}") =>
    `api/patients/${patientId}/inr-warfarin-calendar`,
  patientWarfarinCalendarItem: (
    patientId: string | number = "{patientId}",
    id: string | number = "{id}",
  ) => `api/patients/${patientId}/inr-warfarin-calendar/${id}`,
} as const;

export const API_PATH_TEMPLATES = [
  ApiPaths.chatNotifications,
  ApiPaths.chatNotificationsReadAll,
  ApiPaths.chatUnreadCount,
  ApiPaths.devicesRegister,
  ApiPaths.devicesUnregister,
  ApiPaths.doctors,
  ApiPaths.inr,
  ApiPaths.inrCycle,
  ApiPaths.inrResultDosageNextDate,
  ApiPaths.inrTtr,
  "api/inr-ttr/all",
  "api/inr-ttr/all/summary",
  "api/inr-ttr/chart",
  "api/inr-ttr/summary",
  ApiPaths.locations,
  ApiPaths.logout,
  ApiPaths.me,
  ApiPaths.notifications,
  ApiPaths.notificationsRead,
  ApiPaths.notificationsReadAll,
  "api/notifications/send",
  ApiPaths.notificationsUnreadCount,
  ApiPaths.notificationItem(),
  ApiPaths.patients,
  ApiPaths.patient(),
  ApiPaths.patientChatMessages(),
  ApiPaths.patientChatMessagesUpload(),
  ApiPaths.patientChatRead(),
  ApiPaths.patientInr(),
  ApiPaths.patientInrAdvice(),
  ApiPaths.patientInrComplication(),
  ApiPaths.patientInrCycle(),
  ApiPaths.patientInrNorm(),
  ApiPaths.patientWarfarinCalendar(),
  ApiPaths.patientWarfarinCalendarItem(),
  ApiPaths.patientInrItem(),
] as const;
