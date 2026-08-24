import dayjs from "dayjs";

const OUTGOING_ROLES = new Set(["doctor", "admin", "staff", "nurse"]);
const INCOMING_ROLES = new Set(["patient", "user", "client"]);

export function idsMatch(
  left?: string | number | null,
  right?: string | number | null,
) {
  const a = String(left ?? "").trim();
  const b = String(right ?? "").trim();
  if (!a || !b) return false;
  if (a === b) return true;
  const na = Number(a);
  const nb = Number(b);
  return Number.isFinite(na) && Number.isFinite(nb) && na === nb;
}

export function namesMatch(left?: string | null, right?: string | null) {
  const a = left?.trim().toLowerCase() ?? "";
  const b = right?.trim().toLowerCase() ?? "";
  return Boolean(a && b && a === b);
}

export function isOwnChatMessage(
  message: {
    senderId?: string | number | null;
    senderName?: string | null;
    senderRole?: string | null;
  },
  userId?: string | number | null,
  selfName?: string | null,
) {
  if (idsMatch(message.senderId, userId)) return true;
  if (namesMatch(message.senderName, selfName)) return true;
  return false;
}

export function isOutgoingMessage(role: string) {
  const value = role.trim().toLowerCase();
  if (INCOMING_ROLES.has(value)) return false;
  return OUTGOING_ROLES.has(value);
}

export function formatChatTime(value: string) {
  if (!value) return "";
  const date = dayjs(value);
  if (!date.isValid()) return value;
  if (date.isSame(dayjs(), "day")) return date.format("HH:mm");
  return date.format("DD.MM");
}

export function formatChatDay(value: string) {
  const date = dayjs(value);
  if (!date.isValid()) return "";
  return date.format("DD.MM.YYYY");
}

export function resolveChatMediaUrl(url?: string | null) {
  if (!url?.trim()) return "";
  if (/^https?:\/\//i.test(url)) return url;
  const base = process.env.EXPO_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "";
  return `${base}/${url.replace(/^\//, "")}`;
}

export const CHAT_MAX_FILE_BYTES = 10 * 1024 * 1024;

const ALLOWED_FILE_TYPES = [
  "application/pdf",
  "image/*",
  "audio/*",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "application/vnd.ms-excel",
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  "application/vnd.ms-powerpoint",
  "application/vnd.openxmlformats-officedocument.presentationml.presentation",
];

const ALLOWED_EXTENSIONS = new Set([
  "pdf",
  "jpg",
  "jpeg",
  "png",
  "gif",
  "webp",
  "heic",
  "mp3",
  "m4a",
  "wav",
  "aac",
  "ogg",
  "3gp",
  "doc",
  "docx",
  "xls",
  "xlsx",
  "ppt",
  "pptx",
]);

export function chatPickerTypes() {
  return ALLOWED_FILE_TYPES;
}

export function isAllowedChatFile(name: string, mimeType?: string | null) {
  const mime = (mimeType ?? "").toLowerCase();
  if (
    mime.startsWith("image/") ||
    mime.startsWith("audio/") ||
    mime === "application/pdf" ||
    mime.includes("msword") ||
    mime.includes("officedocument") ||
    mime.includes("ms-excel") ||
    mime.includes("ms-powerpoint") ||
    mime.includes("opendocument")
  ) {
    return true;
  }
  const ext = name.split(".").pop()?.toLowerCase() ?? "";
  return ALLOWED_EXTENSIONS.has(ext);
}

export function formatRecordingTime(ms: number) {
  const total = Math.max(0, Math.floor(ms / 1000));
  const minutes = String(Math.floor(total / 60)).padStart(2, "0");
  const seconds = String(total % 60).padStart(2, "0");
  return `${minutes}:${seconds}`;
}

export function senderInitial(name: string) {
  const letter = name.trim().charAt(0);
  return letter ? letter.toUpperCase() : "?";
}
