import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

type StatCardProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  // Carte mise en avant : prend la couleur de la salle (primary).
  highlight?: boolean;
};

export function StatCard({ label, value, hint, highlight = false }: StatCardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border p-5",
        highlight
          ? "border-transparent bg-primary text-on-primary"
          : "border-border bg-surface",
      )}
    >
      <p className={cn("text-sm font-semibold", !highlight && "text-foreground-muted")}>
        {label}
      </p>
      <p className="mt-1 font-display text-3xl font-extrabold tabular-nums">{value}</p>
      {hint && (
        <p className={cn("mt-1 text-sm", !highlight && "text-foreground-muted")}>{hint}</p>
      )}
    </div>
  );
}