import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Liste déroulante native : accessible au clavier et sur mobile.
// Mêmes classes que components/ui/input.tsx, pour une hauteur et une bordure identiques.
// Pas de « w-full » : dans un formulaire en ligne, la liste garde sa largeur naturelle.
export function Select({ className, ...props }: ComponentProps<"select">) {
  return (
    <select
      className={cn(
        "h-11 min-w-48 rounded-xl border border-border bg-surface-raised px-4 text-sm text-foreground " +
          "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary " +
          "aria-invalid:border-danger " +
          "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  );
}