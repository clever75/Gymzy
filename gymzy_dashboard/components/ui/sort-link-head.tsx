import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";

// En-tête de colonne triable, commun à toutes les listes : un lien vers l'adresse qui
// applique le tri suivant (l'écran qui l'utilise calcule `href`, en gardant ses filtres
// et sans « page » : changer le tri ramène à la page 1).
// `direction` vaut null si la liste n'est pas triée sur cette colonne.
// aria-sort annonce le sens du tri aux lecteurs d'écran ; la flèche le montre aux yeux.
export function SortLinkHead({
  label,
  href,
  direction,
  className,
}: {
  label: string;
  href: string;
  direction: "asc" | "desc" | null;
  className?: string;
}) {
  const Icon = direction === null ? ChevronsUpDown : direction === "asc" ? ArrowUp : ArrowDown;
  const ariaSort = direction === null ? "none" : direction === "asc" ? "ascending" : "descending";

  return (
    <TableHead aria-sort={ariaSort} className={className}>
      <Link
        href={href}
        className="inline-flex items-center gap-1 rounded font-bold hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {label}
        <Icon aria-hidden="true" className={direction === null ? "size-3.5 opacity-40" : "size-3.5"} />
      </Link>
    </TableHead>
  );
}
