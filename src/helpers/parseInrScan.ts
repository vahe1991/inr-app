import { normalizeDecimalInput } from "@/helpers/normalizeDecimalInput";
import dayjs from "dayjs";

export type InrScanFields = {
  value?: string;
  date?: Date;
};

const MIN_INR = 0.5;
const MAX_INR = 12;
const OLDEST_YEAR = 2000;

/** ML Kit reads the Cyrillic "МНО" label with the latin model, so "MHO" shows up too. */
const LABEL = "(?:i\\W{0,2}n\\W{0,2}r|m\\W{0,2}h\\W{0,2}o|мно)";
const DECIMAL = "(\\d{1,2}[.,]\\d{1,2})";

const VALUE_AFTER_LABEL = new RegExp(`${LABEL}[^\\d]{0,24}${DECIMAL}`, "ig");
const VALUE_BEFORE_LABEL = new RegExp(`${DECIMAL}[^\\d]{0,8}${LABEL}`, "ig");
const ANY_DECIMAL = /\b\d{1,2}[.,]\d{1,2}\b/g;
/** Lab sheets print reference ranges like `0.80 - 1.20` next to the result. */
const RANGE = /\d{1,3}[.,]\d{1,2}\s*[-–—]\s*\d{1,3}[.,]\d{1,2}/g;
const DATE =
  /\b(\d{1,4})[.\-/](\d{1,2})[.\-/](\d{2,4})(?:\s+\d{1,2}:\d{2})?\b/g;
const SAMPLE_DATE = new RegExp(
  `(?:նմուշառմ\\w*|նմուշ|sampling|sample\\s*date|հետազոտութ\\w*)[^\\d]{0,40}${DATE.source}`,
  "i",
);

function toInrValue(raw: string | undefined): string | undefined {
  if (!raw) return undefined;

  const normalized = normalizeDecimalInput(raw);
  const parsed = Number(normalized);

  if (!Number.isFinite(parsed) || parsed < MIN_INR || parsed > MAX_INR) {
    return undefined;
  }

  return normalized;
}

function firstLabelledValue(text: string): string | undefined {
  for (const match of text.matchAll(VALUE_AFTER_LABEL)) {
    const value = toInrValue(match[1]);
    if (value) return value;
  }

  for (const match of text.matchAll(VALUE_BEFORE_LABEL)) {
    const value = toInrValue(match[1]);
    if (value) return value;
  }

  return undefined;
}

function findValue(text: string): string | undefined {
  const withoutRanges = text.replace(RANGE, " ");
  const labelled = firstLabelledValue(withoutRanges);

  if (labelled) return labelled;

  const candidates = new Set(
    (withoutRanges.match(ANY_DECIMAL) ?? [])
      .map(toInrValue)
      .filter((candidate): candidate is string => Boolean(candidate)),
  );

  // Guessing is only safe when the sheet holds a single INR-looking number.
  return candidates.size === 1 ? [...candidates][0] : undefined;
}

function toDate(
  first: string,
  second: string,
  third: string,
): Date | undefined {
  const [year, month, day] =
    first.length === 4 ? [first, second, third] : [third, second, first];
  const fullYear = year.length === 2 ? `20${year}` : year;
  const parsed = dayjs(
    `${fullYear}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`,
  );

  if (!parsed.isValid()) return undefined;
  if (parsed.year() < OLDEST_YEAR || parsed.isAfter(dayjs(), "day")) {
    return undefined;
  }

  return parsed.toDate();
}

function dateFromMatch(
  first?: string,
  second?: string,
  third?: string,
): Date | undefined {
  if (!first || !second || !third) return undefined;
  return toDate(first, second, third);
}

function findDate(text: string): Date | undefined {
  const labelled = text.match(SAMPLE_DATE);
  const fromLabel = dateFromMatch(
    labelled?.[1],
    labelled?.[2],
    labelled?.[3],
  );
  if (fromLabel) return fromLabel;

  const dates = [...text.matchAll(DATE)]
    .map(([, first, second, third]) => toDate(first, second, third))
    .filter((date): date is Date => Boolean(date));

  if (!dates.length) return undefined;

  // A lab sheet also prints the birth date, so the newest date is the exam one.
  return dates.reduce((latest, date) => (date > latest ? date : latest));
}

/** Pulls the INR value and the exam date out of the text recognized on a lab sheet. */
export function parseInrScan(text: string): InrScanFields {
  DATE.lastIndex = 0;
  RANGE.lastIndex = 0;
  VALUE_AFTER_LABEL.lastIndex = 0;
  VALUE_BEFORE_LABEL.lastIndex = 0;
  ANY_DECIMAL.lastIndex = 0;

  // "05.10.2026" would otherwise read as the value 5.10.
  const withoutDates = text.replace(DATE, " ");

  return {
    value: findValue(withoutDates),
    date: findDate(text),
  };
}
