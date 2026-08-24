export interface ChatMessageType {
  id: number;
  patientId: number;
  message: string;
  createdAt: string;
}

export interface ChatMessageResponseType {
  data: ChatMessageType[];
}
