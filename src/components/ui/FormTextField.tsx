import { TextField } from "@/components/ui/TextField";
import { normalizeDecimalInput } from "@/helpers/normalizeDecimalInput";
import type { ComponentProps } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

type FormTextFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<
  ComponentProps<typeof TextField>,
  "value" | "onChangeText" | "onBlur" | "error"
> & {
  control: Control<TFieldValues>;
  name: TName;
  rules?: Omit<
    RegisterOptions<TFieldValues, TName>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
};

export function FormTextField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({ control, name, rules, ...props }: FormTextFieldProps<TFieldValues, TName>) {
  const {
    field: { value, onChange, onBlur, ref },
    fieldState: { error },
  } = useController({ control, name, rules });

  const isDecimal =
    props.keyboardType === "decimal-pad" ||
    props.keyboardType === "numeric" ||
    props.keyboardType === "number-pad";

  return (
    <TextField
      {...props}
      ref={ref}
      value={value == null ? "" : String(value)}
      onChangeText={(text) =>
        onChange(isDecimal ? normalizeDecimalInput(text) : text)
      }
      onBlur={onBlur}
      error={error?.message}
    />
  );
}
