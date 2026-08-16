export type MessageSenderRole = "doctor" | "patient" | "admin" | "staff";

export type MessageStatus = "sending" | "sent" | "delivered" | "failed";

export type MessageType = "text" | "image" | "file";

export interface ChatAttachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface ChatMessage {
  id: string;
  patientId: number;
  senderId: string;
  senderName: string;
  senderRole: MessageSenderRole;
  type: MessageType;
  content: string;
  attachments?: ChatAttachment[];
  status: MessageStatus;
  createdAt: string;
  isRead: boolean;
}

/** One notification per patient — updated when new messages arrive. */
export interface ChatNotification {
  id: string;
  patientId: number;
  patientName: string;
  lastMessage: string;
  lastMessagePreview: string;
  senderName: string;
  timestamp: string;
  unreadCount: number;
  isRead: boolean;
}

export interface SendMessagePayload {
  patientId: number;
  content: string;
  type?: MessageType;
}

/** React Native has no `File`; pickers return a uri-based descriptor instead. */
export interface ChatFileInput {
  uri: string;
  name: string;
  mimeType: string;
  size: number;
}

export interface UploadFilePayload {
  patientId: number;
  file: ChatFileInput;
  onProgress?: (percent: number) => void;
}

export type ChatEventType =
  | "message:new"
  | "message:updated"
  | "notification:updated"
  | "notifications:read";

export interface ChatEvent {
  type: ChatEventType;
  patientId?: number;
}

export interface ChatStorageData {
  messages: ChatMessage[];
  readAtByPatient: Record<string, string>;
}
