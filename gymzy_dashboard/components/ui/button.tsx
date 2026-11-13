import { cva, type VariantProps } from "class-variance-authority";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Exporté pour qu'un lien (<a>) puisse reprendre exactement le style d'un bouton.
export const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 rounded-xl font-bold transition-colors " +
    "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
    "disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        primary: "bg-primary text-on-primary hover:opacity-90",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-surface-raised",
        ghost: "bg-transparent text-foreground hover:bg-surface-raised",
        danger: "bg-danger-surface text-danger hover:opacity-90",
      },
      size: {
        sm: "h-9 px-3 text-sm",
        md: "h-11 px-5 text-sm",
        lg: "h-12 px-6 text-base",
      },
    },
    defaultVariants: { variant: "primary", size: "md" },
  },
);

type ButtonProps = ComponentProps<"button"> &
  VariantProps<typeof buttonVariants>;

export function Button({ className, variant, size, ...props }: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      {...props}
    />
  );
}