export function normalizeDecimalInput(text: string): string {
  const digitsAndDots = text.replace(/,/g, ".").replace(/[^\d.]/g, "");
  const firstDot = digitsAndDots.indexOf(".");

  if (firstDot === -1) return digitsAndDots;

  const whole = digitsAndDots.slice(0, firstDot);
  const fraction = digitsAndDots.slice(firstDot + 1).replace(/\./g, "");

  return `${whole || "0"}.${fraction}`;
}
