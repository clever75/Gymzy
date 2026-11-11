import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full px-3 py-1 text-xs font-bold whitespace-nowrap",
  {
    variants: {
      variant: {
        success: "bg-success-surface text-success",
        warning: "bg-warning-surface text-warning",
        danger: "bg-danger-surface text-danger",
        info: "bg-info-surface text-primary",
        neutral: "bg-surface-raised text-foreground-muted",
      },
    },
    defaultVariants: { variant: "neutral" },
  },
);

type BadgeProps = ComponentProps<"span"> & VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}