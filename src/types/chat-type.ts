export interface ChatMessageResponseType {
  data: ChatMessagePageType;
}

export interface ChatMessagePageType {
  items: ChatMessageType[];
  hasMore: boolean;
}

export interface ChatMessageType {
  id: string;
  patientId: number;
  senderId: string;
  senderName: string;
  senderRole: string;
  senderPhoto?: string | null;
  type: string;
  content: string;
  attachments: Attachment[];
  status: string;
  createdAt: string;
  isRead: boolean;
}

export interface Attachment {
  id: string;
  name: string;
  url: string;
  mimeType: string;
  size: number;
}

export interface ChatFileInput {
  uri: string;
  name: string;
  type: string;
}

export interface ChatInboxItemType {
  id: string | number;
  patientId: number;
  patientName: string;
  lastMessage: string;
  timestamp: string;
  unreadCount: number;
  isRead: boolean;
  photo?: string | null;
}

export interface ChatInboxPageType {
  items: ChatInboxItemType[];
  hasMore: boolean;
  totalCount: number;
  unreadCount: number;
}
