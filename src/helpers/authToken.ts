export function userIdFromToken(token?: string | null) {
  if (!token) return null;
  try {
    const part = token.split(".")[1];
    if (!part) return null;
    const padded = part.replace(/-/g, "+").replace(/_/g, "/");
    const pad =
      padded.length % 4 === 0 ? "" : "=".repeat(4 - (padded.length % 4));
    const payload = JSON.parse(atob(padded + pad)) as Record<string, unknown>;
    const user =
      payload.user && typeof payload.user === "object"
        ? (payload.user as Record<string, unknown>)
        : null;
    const id =
      asId(payload.id) ??
      asId(payload.userId) ??
      asId(payload.user_id) ??
      asId(user?.id) ??
      asId(user?.userId) ??
      asId(payload.uid) ??
      asId(payload.sub);
    return id;
  } catch {
    return null;
  }
}

function asId(value: unknown) {
  if (value == null || value === "") return null;
  const id = String(value).trim();
  if (!id || id.includes("@")) return null;
  return id;
}
