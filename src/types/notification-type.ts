export interface NotificationRequestType {
  is_read?: boolean;
  limit?: number;
  offset?: number;
}

export interface NotificationResponseType {
  data: NotificationDataType;
}

export interface NotificationDataType {
  notifications: NotificationType[];
  unreadCount: number;
  totalCount: number;
  limit: number;
  offset: number;
}

export interface NotificationType {
  id: number;
  userId: number;
  type:
    | "complicatiions"
    | "advances"
    | "test_give_date"
    | "dosage"
    | "inr_result"
    | "other";
  title: string;
  body: string;
  data?: {
    patientId: number;
  };
  isRead: boolean;
  readAt: any;
  createdAt: number;
}
