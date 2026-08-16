import type {
  ChatAttachment,
  ChatEvent,
  ChatMessage,
  ChatNotification,
  ChatStorageData,
  SendMessagePayload,
  UploadFilePayload,
} from "@/types/chat.types";
import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "inr-chat-data";
const ATTACHMENTS_KEY = "inr-chat-attachments";
const CURRENT_USER_ID = "admin";
const CURRENT_USER_NAME = "Admin D.";

type ChatListener = (event: ChatEvent) => void;

const listeners = new Set<ChatListener>();

export const chatQueryKeys = {
  all: ["chat"] as const,
  notifications: () => ["chat", "notifications"] as const,
  unreadCount: () => ["chat", "unread-count"] as const,
  messages: (patientId: number) => ["chat", "messages", patientId] as const,
};

function emit(event: ChatEvent): void {
  listeners.forEach((listener) => listener(event));
}

export function subscribeToChatEvents(listener: ChatListener): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function delay(ms = 300): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms + Math.random() * 200));
}

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

function nowIso(): string {
  return new Date().toISOString();
}

function hoursAgo(hours: number): string {
  return new Date(Date.now() - hours * 60 * 60 * 1000).toISOString();
}

function minutesAgo(minutes: number): string {
  return new Date(Date.now() - minutes * 60 * 1000).toISOString();
}

function resolvePatientName(
  messages: ChatMessage[],
  patientId: number,
): string {
  const fromPatient = messages.find(
    (m) => m.patientId === patientId && m.senderRole === "patient",
  );
  return fromPatient?.senderName ?? `Պացիենտ #${patientId}`;
}

function seedMessages(): ChatMessage[] {
  return [
    {
      id: "seed-21-1",
      patientId: 21,
      senderId: "doctor-1",
      senderName: "Բժ. Հարությունյան",
      senderRole: "doctor",
      type: "text",
      content:
        "Բարի լույս, Աննա: Ես վերանայել եմ ձեր վերջին INR ցուցանիշը՝ 2.5 — այն բուժական նորմայի սահմաններում է (2.0–3.0): Հիանալի լուր:",
      status: "delivered",
      createdAt: hoursAgo(2),
      isRead: false,
    },
    {
      id: "seed-21-2",
      patientId: 21,
      senderId: "patient-21",
      senderName: "Աննա Հակոբյան",
      senderRole: "patient",
      type: "text",
      content: "Մի փոքր անհանգստացած էի:",
      status: "delivered",
      createdAt: hoursAgo(2),
      isRead: false,
    },
    {
      id: "seed-21-3",
      patientId: 21,
      senderId: "doctor-1",
      senderName: "Բժ. Հարությունյան",
      senderRole: "doctor",
      type: "text",
      content:
        "Անհանգստանալու կարիք չկա: Շարունակեք ընդունել Վարֆարին 5մգ: Եկեք ստուգման 2 շաբաթ հետո:",
      status: "delivered",
      createdAt: minutesAgo(45),
      isRead: false,
    },
    {
      id: "seed-20-1",
      patientId: 20,
      senderId: "patient-20",
      senderName: "Գևորգ Սարգսյան",
      senderRole: "patient",
      type: "text",
      content: "Բժիշկ, INR-ի նոր արդյունքը ստացել եք?",
      status: "delivered",
      createdAt: hoursAgo(5),
      isRead: false,
    },
    {
      id: "seed-19-1",
      patientId: 19,
      senderId: "doctor-2",
      senderName: "Բժ. Պողոսյան",
      senderRole: "doctor",
      type: "text",
      content: "Հիշեցում՝ վաղը լաբորատոր հետազոտություն:",
      status: "delivered",
      createdAt: hoursAgo(24),
      isRead: true,
    },
  ];
}

async function loadData(): Promise<ChatStorageData> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as ChatStorageData;
      if (parsed.messages?.length) return parsed;
    }
  } catch {
    /* use seed */
  }

  const seeded: ChatStorageData = {
    messages: seedMessages(),
    readAtByPatient: { "19": nowIso() },
  };
  await saveData(seeded);
  return seeded;
}

async function saveData(data: ChatStorageData): Promise<void> {
  await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data));
}

async function loadAttachments(): Promise<Record<string, ChatAttachment>> {
  try {
    const raw = await AsyncStorage.getItem(ATTACHMENTS_KEY);
    if (raw) return JSON.parse(raw) as Record<string, ChatAttachment>;
  } catch {
    /* empty */
  }
  return {};
}

async function saveAttachments(
  map: Record<string, ChatAttachment>,
): Promise<void> {
  await AsyncStorage.setItem(ATTACHMENTS_KEY, JSON.stringify(map));
}

function truncatePreview(text: string, max = 80): string {
  const normalized = text.replace(/\s+/g, " ").trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max)}…`;
}

function buildNotifications(messages: ChatMessage[]): ChatNotification[] {
  const byPatient = new Map<number, ChatMessage[]>();

  for (const message of messages) {
    const list = byPatient.get(message.patientId) ?? [];
    list.push(message);
    byPatient.set(message.patientId, list);
  }

  const notifications: ChatNotification[] = [];

  for (const [patientId, patientMessages] of byPatient) {
    const sorted = [...patientMessages].sort(
      (a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
    );
    const latest = sorted[0];
    const unreadCount = patientMessages.filter(
      (m) => !m.isRead && m.senderId !== CURRENT_USER_ID,
    ).length;

    notifications.push({
      id: `notif-${patientId}`,
      patientId,
      patientName: resolvePatientName(patientMessages, patientId),
      lastMessage: latest.content,
      lastMessagePreview: truncatePreview(latest.content),
      senderName: latest.senderName,
      timestamp: latest.createdAt,
      unreadCount,
      isRead: unreadCount === 0,
    });
  }

  return notifications.sort(
    (a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
  );
}

export async function getChatNotifications(
  offset = 0,
  limit = 50,
): Promise<{ items: ChatNotification[]; hasMore: boolean }> {
  await delay(200);
  const data = await loadData();
  const all = buildNotifications(data.messages);
  const items = all.slice(offset, offset + limit);
  return { items, hasMore: offset + limit < all.length };
}

export async function getUnreadChatCount(): Promise<number> {
  await delay(100);
  const data = await loadData();
  return data.messages.filter(
    (m) => !m.isRead && m.senderId !== CURRENT_USER_ID,
  ).length;
}

export async function getPatientMessages(
  patientId: number,
): Promise<ChatMessage[]> {
  await delay(250);
  const data = await loadData();
  return data.messages
    .filter((m) => m.patientId === patientId)
    .sort(
      (a, b) =>
        new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime(),
    );
}

export async function sendChatMessage(
  payload: SendMessagePayload,
): Promise<ChatMessage> {
  const message: ChatMessage = {
    id: generateId(),
    patientId: payload.patientId,
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    senderRole: "admin",
    type: payload.type ?? "text",
    content: payload.content.trim(),
    status: "sending",
    createdAt: nowIso(),
    isRead: true,
  };

  const data = await loadData();
  data.messages.push(message);
  await saveData(data);
  emit({ type: "message:new", patientId: payload.patientId });

  await delay(400);

  message.status = "sent";
  await saveData(data);
  emit({ type: "message:updated", patientId: payload.patientId });

  await delay(300);

  message.status = "delivered";
  await saveData(data);
  emit({ type: "message:updated", patientId: payload.patientId });

  return message;
}

export async function uploadChatFile(
  payload: UploadFilePayload,
): Promise<ChatMessage> {
  const { file, onProgress } = payload;
  const isImage = file.mimeType.startsWith("image/");
  const attachmentId = generateId();

  const message: ChatMessage = {
    id: generateId(),
    patientId: payload.patientId,
    senderId: CURRENT_USER_ID,
    senderName: CURRENT_USER_NAME,
    senderRole: "admin",
    type: isImage ? "image" : "file",
    content: file.name,
    status: "sending",
    createdAt: nowIso(),
    isRead: true,
  };

  const data = await loadData();
  data.messages.push(message);
  await saveData(data);
  emit({ type: "message:new", patientId: payload.patientId });

  for (let p = 10; p <= 90; p += 20) {
    await delay(150);
    onProgress?.(p);
  }

  try {
    const attachment: ChatAttachment = {
      id: attachmentId,
      name: file.name,
      url: file.uri,
      mimeType: file.mimeType || "application/octet-stream",
      size: file.size,
    };

    const attachments = await loadAttachments();
    attachments[attachmentId] = attachment;
    await saveAttachments(attachments);

    message.attachments = [attachment];
    message.status = "delivered";
    await saveData(data);
    onProgress?.(100);
    emit({ type: "message:updated", patientId: payload.patientId });
    return message;
  } catch {
    message.status = "failed";
    await saveData(data);
    emit({ type: "message:updated", patientId: payload.patientId });
    throw new Error("UPLOAD_FAILED");
  }
}

export async function getAttachmentDownloadUrl(
  attachmentId: string,
): Promise<string | null> {
  const attachments = await loadAttachments();
  return attachments[attachmentId]?.url ?? null;
}

export async function markPatientChatAsRead(patientId: number): Promise<void> {
  await delay(100);
  const data = await loadData();
  let changed = false;

  for (const message of data.messages) {
    if (
      message.patientId === patientId &&
      !message.isRead &&
      message.senderId !== CURRENT_USER_ID
    ) {
      message.isRead = true;
      changed = true;
    }
  }

  if (changed) {
    data.readAtByPatient[String(patientId)] = nowIso();
    await saveData(data);
    emit({ type: "notifications:read", patientId });
    emit({ type: "notification:updated", patientId });
  }
}

export async function markNotificationAsRead(patientId: number): Promise<void> {
  return markPatientChatAsRead(patientId);
}

export async function markAllNotificationsAsRead(): Promise<void> {
  await delay(150);
  const data = await loadData();
  let changed = false;

  for (const message of data.messages) {
    if (!message.isRead && message.senderId !== CURRENT_USER_ID) {
      message.isRead = true;
      changed = true;
    }
  }

  if (changed) {
    await saveData(data);
    emit({ type: "notifications:read" });
    emit({ type: "notification:updated" });
  }
}

export async function retryFailedMessage(
  messageId: string,
): Promise<ChatMessage> {
  const data = await loadData();
  const message = data.messages.find((m) => m.id === messageId);
  if (!message) throw new Error("MESSAGE_NOT_FOUND");
  if (message.status !== "failed") return message;

  message.status = "sending";
  await saveData(data);
  emit({ type: "message:updated", patientId: message.patientId });

  await delay(500);
  message.status = "delivered";
  await saveData(data);
  emit({ type: "message:updated", patientId: message.patientId });
  return message;
}

/** Active patient ID — chat open for this patient skips unread increment. */
let activeChatPatientId: number | null = null;

export function setActiveChatPatient(patientId: number | null): void {
  activeChatPatientId = patientId;
}

export function getActiveChatPatient(): number | null {
  return activeChatPatientId;
}

/** Simulates incoming patient/doctor messages for demo real-time behaviour. */
let simulationStarted = false;

export function startChatSimulation(): () => void {
  if (simulationStarted) return () => undefined;
  simulationStarted = true;

  const interval = setInterval(() => {
    if (Math.random() > 0.35) return;

    void (async () => {
      const data = await loadData();
      const patientIds = [...new Set(data.messages.map((m) => m.patientId))];
      const patientId =
        patientIds[Math.floor(Math.random() * patientIds.length)] ?? 21;
      const patientName = resolvePatientName(data.messages, patientId);

      const isPatientSender = Math.random() > 0.4;
      const incoming: ChatMessage = {
        id: generateId(),
        patientId,
        senderId: isPatientSender ? `patient-${patientId}` : "doctor-1",
        senderName: isPatientSender ? patientName : "Բժ. Հարությունյան",
        senderRole: isPatientSender ? "patient" : "doctor",
        type: "text",
        content: isPatientSender
          ? "Բժիշկ, կարո՞ղ եք ստուգել իմ INR արդյունքը:"
          : "INR արդյունքը ստացված է, խնդրում եմ վերանայել:",
        status: "delivered",
        createdAt: nowIso(),
        isRead: activeChatPatientId === patientId,
      };

      data.messages.push(incoming);
      await saveData(data);
      emit({ type: "message:new", patientId });
      emit({ type: "notification:updated", patientId });
    })();
  }, 18_000);

  return () => {
    clearInterval(interval);
    simulationStarted = false;
  };
}

export { CURRENT_USER_ID, CURRENT_USER_NAME };
