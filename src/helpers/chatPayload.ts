import type {
  ChatInboxItemType,
  ChatInboxPageType,
  ChatMessagePageType,
  ChatMessageType,
} from "@/types/chat-type";

function asRecord(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object"
    ? (value as Record<string, unknown>)
    : null;
}

function unwrap(res: unknown): unknown {
  const body = asRecord(res)?.data ?? res;
  const nested = asRecord(body)?.data;
  return nested ?? body;
}

function asString(value: unknown, fallback = "") {
  return value == null ? fallback : String(value);
}

function asNumber(value: unknown, fallback = 0) {
  const num = Number(value);
  return Number.isFinite(num) ? num : fallback;
}

export function asChatMessagePage(res: unknown): ChatMessagePageType {
  const page = unwrap(res);
  const row = asRecord(page);
  const rawItems = Array.isArray(page)
    ? page
    : (row?.items ?? row?.messages ?? []);
  const items = (Array.isArray(rawItems) ? rawItems : [])
    .map(asChatMessage)
    .filter(Boolean) as ChatMessageType[];

  return {
    items,
    hasMore: Boolean(row?.hasMore ?? row?.has_more),
  };
}

export function asChatMessage(value: unknown): ChatMessageType | null {
  const row = asRecord(value);
  if (!row) return null;
  if (row.content == null && row.id == null) {
    if (row.message) return asChatMessage(row.message);
    if (row.data) return asChatMessage(row.data);
  }
  const attachments = Array.isArray(row.attachments)
    ? row.attachments.map((item) => {
        const file = asRecord(item) ?? {};
        return {
          id: asString(file.id),
          name: asString(file.name),
          url: asString(file.url),
          mimeType: asString(file.mimeType ?? file.mime_type),
          size: asNumber(file.size),
        };
      })
    : [];
  const sender = asRecord(row.sender);

  return {
    id: asString(row.id),
    patientId: asNumber(row.patientId ?? row.patient_id),
    senderId: asString(
      row.senderId ??
        row.sender_id ??
        sender?.id ??
        sender?.userId ??
        sender?.user_id ??
        row.userId ??
        row.user_id,
    ),
    senderName: asString(
      row.senderName ?? row.sender_name ?? sender?.name ?? sender?.fullName,
    ),
    senderRole: asString(row.senderRole ?? row.sender_role ?? sender?.role),
    senderPhoto:
      asString(
        row.senderPhoto ??
          row.sender_photo ??
          sender?.photo ??
          sender?.avatar ??
          sender?.image,
        "",
      ) || null,
    type: asString(row.type, "text"),
    content: asString(row.content),
    attachments,
    status: asString(row.status, "sent"),
    createdAt: asString(row.createdAt ?? row.created_at),
    isRead: Boolean(row.isRead ?? row.is_read),
  };
}

export function asChatMessageFromResponse(value: unknown): ChatMessageType | null {
  const direct = asChatMessage(value);
  if (direct?.id || direct?.content) return direct;
  const row = asRecord(value);
  return (
    asChatMessage(row?.data) ??
    asChatMessage(row?.message) ??
    asChatMessage(asRecord(row?.data)?.message) ??
    asChatMessage(asRecord(row?.data)?.data) ??
    direct
  );
}

export function asChatInboxPage(res: unknown): ChatInboxPageType {
  const page = unwrap(res);
  const row = asRecord(page);
  const rawItems = Array.isArray(page)
    ? page
    : (row?.items ?? row?.notifications ?? []);
  const items = (Array.isArray(rawItems) ? rawItems : [])
    .map(asChatInboxItem)
    .filter(Boolean) as ChatInboxItemType[];

  return {
    items,
    hasMore: Boolean(
      row?.hasMore ?? row?.has_more ?? items.length >= 20,
    ),
    totalCount: asNumber(row?.totalCount ?? row?.total_count, items.length),
    unreadCount: asNumber(row?.unreadCount ?? row?.unread_count),
  };
}

export function asChatInboxItem(value: unknown): ChatInboxItemType | null {
  const row = asRecord(value);
  if (!row) return null;
  const patient = asRecord(row.patient);
  const patientId = asNumber(row.patientId ?? row.patient_id ?? patient?.id);
  if (!patientId) return null;

  return {
    id: asString(row.id, String(patientId)),
    patientId,
    patientName: asString(
      row.patientName ??
        row.patient_name ??
        row.name ??
        patient?.name ??
        patient?.full_name ??
        patient?.fullName,
    ),
    lastMessage: asString(
      row.lastMessage ??
        row.last_message ??
        row.lastMessagePreview ??
        row.preview ??
        row.content,
    ),
    timestamp: asString(
      row.timestamp ?? row.createdAt ?? row.created_at ?? row.updatedAt,
    ),
    unreadCount: asNumber(row.unreadCount ?? row.unread_count),
    isRead: Boolean(row.isRead ?? row.is_read ?? !(row.unreadCount ?? 0)),
    photo: asString(row.photo ?? row.avatar ?? patient?.photo, "") || null,
  };
}

export function asUnreadCount(res: unknown) {
  const body = unwrap(res);
  if (typeof body === "number") return body;
  const row = asRecord(body);
  return (
    Number(row?.unreadCount ?? row?.count ?? row?.unread_count ?? 0) || 0
  );
}
