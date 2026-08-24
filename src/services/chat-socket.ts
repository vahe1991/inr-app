const WS_URL = process.env.EXPO_PUBLIC_WS_URL || "wss://inr.xlab.am/ws";

export type ChatWebSocketHandlers = {
  onOpen?: () => void;
  onAuthOk?: (userId: unknown) => void;
  onAuthFail?: () => void;
  onMessageNew?: (patientId: unknown, message: unknown) => void;
  onNotificationUpdated?: (patientId: unknown) => void;
  onNotificationsRead?: (patientId: unknown) => void;
  onError?: () => void;
  onClose?: () => void;
};

export type ChatPresence = {
  viewing: boolean;
  typing: boolean;
};

const EMPTY_PRESENCE: ChatPresence = { viewing: false, typing: false };

let ws: WebSocket | null = null;
let reconnectTimer: ReturnType<typeof setTimeout> | null = null;
let viewingPatientId: number | null = null;
let ownUserId: string | null = null;
let lastTypingSentAt = 0;
const presence = new Map<number, ChatPresence>();
const presenceListeners = new Set<() => void>();
const typingTimers = new Map<number, ReturnType<typeof setTimeout>>();

function asPatientId(value: unknown) {
  if (value == null || value === "") return null;
  const id = Number(value);
  return Number.isFinite(id) && id > 0 ? id : null;
}

function sendJson(payload: Record<string, unknown>) {
  if (ws?.readyState !== WebSocket.OPEN) return false;
  ws.send(JSON.stringify(payload));
  return true;
}

function emitPresence() {
  presenceListeners.forEach((listener) => listener());
}

export function getChatPresence(patientId: number): ChatPresence {
  return presence.get(patientId) ?? EMPTY_PRESENCE;
}

export function subscribeChatPresence(listener: () => void) {
  presenceListeners.add(listener);
  return () => {
    presenceListeners.delete(listener);
  };
}

function setPresence(patientId: number, patch: Partial<ChatPresence>) {
  const prev = getChatPresence(patientId);
  const next = { ...prev, ...patch };
  if (prev.viewing === next.viewing && prev.typing === next.typing) return;
  presence.set(patientId, next);
  emitPresence();
}

function clearTypingTimer(patientId: number) {
  const timer = typingTimers.get(patientId);
  if (timer) clearTimeout(timer);
  typingTimers.delete(patientId);
}

function markTyping(patientId: number, typing: boolean) {
  setPresence(patientId, { typing });
  clearTypingTimer(patientId);
  if (!typing) return;
  typingTimers.set(
    patientId,
    setTimeout(() => {
      typingTimers.delete(patientId);
      setPresence(patientId, { typing: false });
    }, 2500),
  );
}

function isOwnEvent(data: Record<string, unknown>, nested: Record<string, unknown> | null) {
  if (!ownUserId) return false;
  const from =
    data.userId ??
    data.user_id ??
    data.senderId ??
    data.sender_id ??
    nested?.userId ??
    nested?.user_id ??
    nested?.senderId ??
    nested?.sender_id;
  return from != null && String(from) === ownUserId;
}

function asBool(value: unknown, fallback: boolean) {
  if (value === false || value === 0 || value === "false" || value === "stop") {
    return false;
  }
  if (value === true || value === 1 || value === "true" || value === "start") {
    return true;
  }
  return fallback;
}

export function setChatViewing(patientId: number | null) {
  viewingPatientId = patientId;
  sendJson({ action: "viewing", patientId });
}

export function sendChatTyping(patientId: number) {
  const now = Date.now();
  if (now - lastTypingSentAt < 800) return;
  lastTypingSentAt = now;
  sendJson({ action: "typing", patientId });
}

export function connectChatWebSocket(
  token: string,
  handlers: ChatWebSocketHandlers = {},
) {
  if (!token) return;

  disconnectChatWebSocket();

  ws = new WebSocket(WS_URL);

  ws.onopen = () => {
    ws?.send(
      JSON.stringify({
        action: "auth",
        token,
      }),
    );
    handlers.onOpen?.();
  };

  ws.onmessage = (event) => {
    let data: Record<string, unknown>;
    try {
      const raw = event.data;
      data =
        typeof raw === "string"
          ? (JSON.parse(raw) as Record<string, unknown>)
          : (raw as Record<string, unknown>);
    } catch {
      return;
    }

    if (!data || typeof data !== "object") return;

    const nested =
      data.data && typeof data.data === "object"
        ? (data.data as Record<string, unknown>)
        : null;
    const action = String(data.action ?? nested?.action ?? "");
    const type = String(data.type ?? nested?.type ?? action);
    const patientId =
      data.patientId ??
      data.patient_id ??
      nested?.patientId ??
      nested?.patient_id;
    const message = data.message ?? nested?.message;

    if (action === "auth_ok") {
      const userId =
        data.userId ??
        data.user_id ??
        nested?.userId ??
        nested?.user_id;
      ownUserId = userId == null || userId === "" ? ownUserId : String(userId);
      handlers.onAuthOk?.(userId);
      if (viewingPatientId != null) {
        sendJson({ action: "viewing", patientId: viewingPatientId });
      }
      return;
    }

    if (action === "auth_fail") {
      handlers.onAuthFail?.();
      ws?.close();
      return;
    }

    if (type === "message:new") {
      handlers.onMessageNew?.(patientId, message ?? nested ?? data);
      return;
    }

    if (type === "notification:updated") {
      handlers.onNotificationUpdated?.(patientId);
      return;
    }

    if (type === "notifications:read") {
      handlers.onNotificationsRead?.(patientId);
      return;
    }

    if (type === "viewing" || action === "viewing") {
      if (isOwnEvent(data, nested)) return;
      const pid = asPatientId(patientId);
      const viewing = asBool(
        data.viewing ?? nested?.viewing ?? data.isViewing,
        pid != null,
      );
      if (pid) {
        setPresence(pid, { viewing, typing: viewing ? getChatPresence(pid).typing : false });
        if (!viewing) markTyping(pid, false);
        return;
      }
      for (const [id] of presence) {
        setPresence(id, { viewing: false, typing: false });
      }
      return;
    }

    if (type === "typing" || action === "typing") {
      if (isOwnEvent(data, nested)) return;
      const pid = asPatientId(patientId);
      if (!pid) return;
      markTyping(
        pid,
        asBool(data.typing ?? nested?.typing ?? data.isTyping, true),
      );
    }
  };

  ws.onerror = () => {
    handlers.onError?.();
  };

  ws.onclose = () => {
    handlers.onClose?.();
    scheduleReconnect(token, handlers);
  };
}

function scheduleReconnect(token: string, handlers: ChatWebSocketHandlers) {
  if (reconnectTimer) return;

  reconnectTimer = setTimeout(() => {
    reconnectTimer = null;
    connectChatWebSocket(token, handlers);
  }, 3000);
}

export function disconnectChatWebSocket() {
  if (reconnectTimer) {
    clearTimeout(reconnectTimer);
    reconnectTimer = null;
  }

  if (ws) {
    ws.onclose = null;
    ws.close();
    ws = null;
  }
}
