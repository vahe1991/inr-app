import { DateField } from "@/components/ui/DateField";
import dayjs from "dayjs";
import type { ComponentProps } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

type FormDateFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<
  ComponentProps<typeof DateField>,
  "value" | "onChange" | "onBlur" | "error"
> & {
  control: Control<TFieldValues>;
  name: TName;
  rules?: Omit<
    RegisterOptions<TFieldValues, TName>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
  /** Keep the form value as a formatted string (e.g. "YYYY-MM-DD") instead of a Date. */
  valueFormat?: string;
};

export function FormDateField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  rules,
  valueFormat,
  ...props
}: FormDateFieldProps<TFieldValues, TName>) {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ control, name, rules });

  const raw: unknown = value;
  const parsed =
    raw instanceof Date
      ? raw
      : typeof raw === "string" && dayjs(raw).isValid()
        ? dayjs(raw).toDate()
        : null;

  return (
    <DateField
      {...props}
      value={parsed}
      onChange={(date) =>
        onChange(valueFormat ? dayjs(date).format(valueFormat) : date)
      }
      onBlur={onBlur}
      error={error?.message}
    />
  );
}
