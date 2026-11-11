import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: ComponentProps<"input">) {
  return (
    <input
      className={cn(
        "h-11 w-full rounded-xl border border-border bg-surface-raised px-4 text-sm text-foreground " +
          "placeholder:text-foreground-muted " +
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
          "aria-invalid:border-danger " +
          "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}