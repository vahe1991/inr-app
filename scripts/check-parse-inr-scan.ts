import { parseInrScan } from "../src/helpers/parseInrScan";

const samples: { name: string; text: string; expect: { value?: string; date?: string } }[] = [
  {
    name: "latin lab sheet",
    text: [
      "MEDICAL CENTER",
      "Patient: Ivanov I.",
      "Date of birth: 14.03.1958",
      "Sample date: 12.08.2026",
      "Prothrombin time  14.2 sec",
      "INR  2.35",
      "Fibrinogen 3.1 g/l",
    ].join("\n"),
    expect: { value: "2.35", date: "2026-08-12" },
  },
  {
    name: "cyrillic MHO read by latin model",
    text: ["Дата: 05.06.2026", "MHO", "3,1", "ПТИ 78%"].join("\n"),
    expect: { value: "3.1", date: "2026-06-05" },
  },
  {
    name: "value before label",
    text: "1,8 INR\n18/07/26",
    expect: { value: "1.8", date: "2026-07-18" },
  },
  {
    name: "iso date",
    text: "Exam 2026-02-09\nI.N.R.: 2.0",
    expect: { value: "2.0", date: "2026-02-09" },
  },
  {
    name: "no label, single plausible decimal",
    text: "Coagulogram 11.06.2026\nResult 2.7",
    expect: { value: "2.7", date: "2026-06-11" },
  },
  {
    name: "no label, ambiguous decimals",
    text: "11.06.2026\n2.7\n3.4",
    expect: { value: undefined, date: "2026-06-11" },
  },
  {
    name: "date only, must not read the date as a value",
    text: "Blood test 05.06.2026",
    expect: { value: undefined, date: "2026-06-05" },
  },
  {
    name: "future date is ignored",
    text: "Print date 05.10.2099\nINR 2.2",
    expect: { value: "2.2", date: undefined },
  },
  {
    name: "out of range value",
    text: "INR 45.9",
    expect: { value: undefined, date: undefined },
  },
  {
    name: "NMBK biochemical sheet",
    text: [
      "Արյան կենսաքիմիական հետազոտություն",
      "Նմուշառման Ամսաթիվ 14-08-2026 15:23",
      "Ազգանուն Անուն Հայրանուն Հարությունյան Տիգրան Մազլենի",
      "Ծննդ Ամսթ. 10-05-1966",
      "Տարիք 60",
      "Միզանյութ 5.3 mmol/l 3.2-7.1",
      "Կրեատինին 109 µmol/l 58-110",
      "Գլյուկոզա 5.1 mmol/l 4.1-5.9",
      "K+ Կալիում 4.9 mmol/l 3.4 - 5.3",
      "Ca 2+ 1.32 mmol/l 1.02 - 1.27",
      "Mg2+ 0.69 mmol/l 0.7 - 1.0",
      "PT պացիենտի 13.0 sec. 11.0 - 14.0",
      "INR 1.10 INR 0.80 - 1.20",
      "PTR 1.08 Rate 0.82 - 1.15",
    ].join("\n"),
    expect: { value: "1.10", date: "2026-08-14" },
  },
];

let failed = 0;

for (const { name, text, expect } of samples) {
  const result = parseInrScan(text);
  const date = result.date
    ? `${result.date.getFullYear()}-${String(result.date.getMonth() + 1).padStart(2, "0")}-${String(result.date.getDate()).padStart(2, "0")}`
    : undefined;
  const ok = result.value === expect.value && date === expect.date;

  if (!ok) failed += 1;

  console.log(
    `${ok ? "PASS" : "FAIL"}  ${name}\n      value=${result.value} (expected ${expect.value})  date=${date} (expected ${expect.date})`,
  );
}

console.log(failed ? `\n${failed} failing sample(s)` : "\nall samples pass");
process.exit(failed ? 1 : 0);
