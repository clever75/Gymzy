import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Le conteneur gère deux choses : l'apparence (même bordure, même fond que Card)
// et le défilement horizontal, pour rester utilisable dès 768 px.
export function Table({ className, ...props }: ComponentProps<"table">) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-border bg-surface">
      <table className={cn("w-full text-sm", className)} {...props} />
    </div>
  );
}

export function TableHeader({ className, ...props }: ComponentProps<"thead">) {
  return <thead className={cn("bg-surface-raised", className)} {...props} />;
}

export function TableBody({ className, ...props }: ComponentProps<"tbody">) {
  return <tbody className={className} {...props} />;
}

export function TableRow({ className, ...props }: ComponentProps<"tr">) {
  return (
    <tr
      className={cn("border-t border-border first:border-t-0 hover:bg-surface-raised/40", className)}
      {...props}
    />
  );
}

// scope="col" indique aux lecteurs d'écran que ce titre décrit sa colonne.
export function TableHead({ className, ...props }: ComponentProps<"th">) {
  return (
    <th
      scope="col"
      className={cn(
        "px-4 py-3 text-left text-xs font-bold whitespace-nowrap text-foreground-muted",
        className,
      )}
      {...props}
    />
  );
}

export function TableCell({ className, ...props }: ComponentProps<"td">) {
  return <td className={cn("px-4 py-3 align-middle", className)} {...props} />;
}

// Ligne affichée quand il n'y a aucun résultat.
export function TableEmpty({ colSpan, children }: { colSpan: number; children: React.ReactNode }) {
  return (
    <tr>
      <td colSpan={colSpan} className="px-4 py-10 text-center text-foreground-muted">
        {children}
      </td>
    </tr>
  );
}