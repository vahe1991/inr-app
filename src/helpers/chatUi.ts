import dayjs from "dayjs";

const OUTGOING_ROLES = new Set(["doctor", "admin", "staff", "nurse"]);

export function isOutgoingMessage(role: string) {
  return OUTGOING_ROLES.has(role.trim().toLowerCase());
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
