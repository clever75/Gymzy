import Link from "next/link";
import { cn } from "@/lib/utils";

interface PaginationProps {
  page: number;
  totalPages: number;
  totalItems: number;
  pageSize: number;
  // Construit l'URL d'une page. Une fonction, et non un simple chemin : quand
  // les filtres arriveront (?statut=...&page=2), ils seront conservés ici.
  buildHref: (page: number) => string;
}

// Exemple avec 12 pages, page 6 : [1, "…", 5, 6, 7, "…", 12]
function getPageNumbers(current: number, total: number): (number | "gap")[] {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const wanted = new Set([1, total, current - 1, current, current + 1]);
  const pages = [...wanted].filter((p) => p >= 1 && p <= total).sort((a, b) => a - b);

  const result: (number | "gap")[] = [];
  pages.forEach((p, i) => {
    if (i > 0 && p - pages[i - 1] > 1) result.push("gap");
    result.push(p);
  });
  return result;
}

const itemBase =
  "inline-flex h-9 min-w-9 items-center justify-center rounded-lg px-3 font-bold";

export function Pagination({ page, totalPages, totalItems, pageSize, buildHref }: PaginationProps) {
  const from = totalItems === 0 ? 0 : (page - 1) * pageSize + 1;
  const to = Math.min(page * pageSize, totalItems);

  return (
    <nav aria-label="Pagination" className="flex flex-wrap items-center justify-between gap-3 text-sm">
      <p className="text-foreground-muted">
        {totalItems === 0 ? "Aucun résultat" : `${from} à ${to} sur ${totalItems}`}
      </p>

      {totalPages > 1 && (
        <ul className="flex items-center gap-1">
          <li>
            {page > 1 ? (
              <Link href={buildHref(page - 1)} className={cn(itemBase, "text-foreground-muted hover:bg-surface-raised")}>
                Précédent
              </Link>
            ) : (
              <span aria-disabled="true" className={cn(itemBase, "text-foreground-muted opacity-40")}>
                Précédent
              </span>
            )}
          </li>

          {getPageNumbers(page, totalPages).map((p, i) =>
            p === "gap" ? (
              <li key={`gap-${i}`} aria-hidden="true" className="px-1 text-foreground-muted">
                …
              </li>
            ) : (
              <li key={p}>
                <Link
                  href={buildHref(p)}
                  aria-current={p === page ? "page" : undefined}
                  className={cn(
                    itemBase,
                    p === page ? "bg-surface-raised text-primary" : "text-foreground-muted hover:bg-surface-raised",
                  )}
                >
                  {p}
                </Link>
              </li>
            ),
          )}

          <li>
            {page < totalPages ? (
              <Link href={buildHref(page + 1)} className={cn(itemBase, "text-foreground-muted hover:bg-surface-raised")}>
                Suivant
              </Link>
            ) : (
              <span aria-disabled="true" className={cn(itemBase, "text-foreground-muted opacity-40")}>
                Suivant
              </span>
            )}
          </li>
        </ul>
      )}
    </nav>
  );
}