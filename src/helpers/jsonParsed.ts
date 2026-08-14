export function jsonParsed(parse: string): string[] {
  try {
    const parsed = JSON.parse(parse);
    return Array.isArray(parsed) ? parsed : [String(parsed)];
  } catch {
    return parse ? [parse] : [];
  }
}
