export type GenderKind = "male" | "female" | "unknown";

export function resolveGender(gender?: string | null): GenderKind {
  const value = (gender ?? "").trim().toLowerCase();
  if (!value) return "unknown";

  if (
    value === "m" ||
    value === "male" ||
    value.includes("արական") ||
    value.includes("տղա") ||
    value.includes("муж") ||
    value.startsWith("man")
  ) {
    return "male";
  }

  if (
    value === "f" ||
    value === "female" ||
    value.includes("իգական") ||
    value.includes("աղջիկ") ||
    value.includes("жен") ||
    value.startsWith("wom")
  ) {
    return "female";
  }

  return "unknown";
}
