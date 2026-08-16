import { SelectField } from "@/components/ui/SelectField";
import type { ComponentProps } from "react";
import {
  useController,
  type Control,
  type FieldPath,
  type FieldValues,
  type RegisterOptions,
} from "react-hook-form";

type FormSelectFieldProps<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
> = Omit<
  ComponentProps<typeof SelectField>,
  "value" | "onChange" | "onBlur" | "error"
> & {
  control: Control<TFieldValues>;
  name: TName;
  rules?: Omit<
    RegisterOptions<TFieldValues, TName>,
    "valueAsNumber" | "valueAsDate" | "setValueAs" | "disabled"
  >;
  onValueChange?: (value: string | number) => void;
};

export function FormSelectField<
  TFieldValues extends FieldValues,
  TName extends FieldPath<TFieldValues>,
>({
  control,
  name,
  rules,
  onValueChange,
  ...props
}: FormSelectFieldProps<TFieldValues, TName>) {
  const {
    field: { value, onChange, onBlur },
    fieldState: { error },
  } = useController({ control, name, rules });

  return (
    <SelectField
      {...props}
      value={value ?? null}
      onChange={(next) => {
        onChange(next);
        onValueChange?.(next);
      }}
      onBlur={onBlur}
      error={error?.message}
    />
  );
}
