import { storage } from "@/libs/storage";

function socketUrl() {
  if (process.env.EXPO_PUBLIC_WS_URL) return process.env.EXPO_PUBLIC_WS_URL;
  const api = process.env.EXPO_PUBLIC_API_BASE_URL;
  if (!api) return "";
  try {
    const url = new URL(api);
    const protocol = url.protocol === "https:" ? "wss:" : "ws:";
    return `${protocol}//${url.host}`;
  } catch {
    return "";
  }
}

export function connectChatSocket(onEvent: () => void) {
  const url = socketUrl();
  if (!url) return () => {};

  let socket: WebSocket | null = null;
  let closed = false;
  let retry: ReturnType<typeof setTimeout> | null = null;

  const open = async () => {
    const token = await storage.getToken();
    if (!token || closed) return;

    socket = new WebSocket(url);
    socket.onopen = () => {
      socket?.send(JSON.stringify({ action: "auth", token }));
    };
    socket.onmessage = (event) => {
      try {
        const data = JSON.parse(String(event.data)) as { action?: string };
        if (data.action === "notification" || data.action === "message") {
          onEvent();
        }
      } catch {
        /* ignore malformed frames */
      }
    };
    socket.onclose = () => {
      if (closed) return;
      retry = setTimeout(() => {
        void open();
      }, 4000);
    };
  };

  void open();

  return () => {
    closed = true;
    if (retry) clearTimeout(retry);
    socket?.close();
  };
}
