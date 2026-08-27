export type LoginPayload = {
  email: string;
  password: string;
};

export type LoginResponse = {
  data: AuthUserResponseData;
};

export interface LogoutResponse {
  data: AuthUserResponseData;
}

export interface AuthUserResponseData {
  token: string;
  user: AuthUserData;
  permissions: Permission[];
}

export interface AuthUserData {
  id: number;
  name: string;
  email: string;
  role: "admin" | "doctor" | "patient" | "nurse" | "operator";
  username: string;
  patientId: any;
  created_at: string;
  updated_at: string;
}

export interface Permission {
  method: HttpMethod;
  path: ApiPath;
}

export type HttpMethod = "GET" | "POST" | "PUT" | "PATCH" | "DELETE";

type ApiPath =
  | "api/chat/notifications"
  | "api/chat/notifications/read-all"
  | "api/chat/unread-count"
  | "api/devices/register"
  | "api/devices/unregister"
  | "api/doctors"
  | "api/inr"
  | "api/inr-cycle"
  | "api/inr-result-dosage-next-date"
  | "api/inr-ttr"
  | "api/inr-ttr/all"
  | "api/inr-ttr/all/summary"
  | "api/inr-ttr/chart"
  | "api/inr-ttr/summary"
  | "api/locations"
  | "api/logout"
  | "api/me"
  | "api/notifications"
  | "api/notifications/read"
  | "api/notifications/read-all"
  | "api/notifications/send"
  | "api/notifications/unread-count"
  | "api/notifications/{id}"
  | "api/patients"
  | "api/patients/{id}"
  | "api/patients/{patientId}/chat/messages"
  | "api/patients/{patientId}/chat/messages/upload"
  | "api/patients/{patientId}/chat/read"
  | "api/patients/{patientId}/inr"
  | "api/patients/{patientId}/inr-advice"
  | "api/patients/{patientId}/inr-complication"
  | "api/patients/{patientId}/inr-cycle"
  | "api/patients/{patientId}/inr-norm"
  | "api/patients/{patientId}/inr-warfarin-calendar"
  | "api/patients/{patientId}/inr-warfarin-calendar/{id}"
  | "api/patients/{patientId}/inr/{id}";
