import Link from "next/link";
import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

type ChipLinkProps = ComponentProps<typeof Link> & { active?: boolean };

// Puce de filtre : un lien qui change l'adresse, donc sans état côté navigateur.
export function ChipLink({ active = false, className, ...props }: ChipLinkProps) {
  return (
    <Link
      aria-current={active ? "true" : undefined}
      className={cn(
        "inline-flex h-9 items-center rounded-full border px-4 text-sm font-bold whitespace-nowrap",
        "transition-colors duration-150 motion-reduce:transition-none",
        "focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary",
        active
          ? "border-transparent bg-foreground text-background"
          : "border-border text-foreground hover:bg-surface-raised",
        className,
      )}
      {...props}
    />
  );
}