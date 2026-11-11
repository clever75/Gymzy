import { useId, type ComponentProps } from "react";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";

type FieldProps = ComponentProps<"input"> & {
  label: string;
  error?: string;
};

export function Field({ label, error, className, id, ...props }: FieldProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const errorId = `${inputId}-error`;

  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      <label htmlFor={inputId} className="text-sm font-bold">
        {label}
      </label>
      <Input
        id={inputId}
        aria-invalid={error ? true : undefined}
        aria-describedby={error ? errorId : undefined}
        {...props}
      />
      {error && (
        <p id={errorId} className="text-sm text-danger">
          {error}
        </p>
      )}
    </div>
  );
}