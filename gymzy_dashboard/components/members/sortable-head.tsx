import Link from "next/link";
import { ArrowDown, ArrowUp, ChevronsUpDown } from "lucide-react";
import { TableHead } from "@/components/ui/table";
import {
  buildMembersQuery,
  nextMemberSort,
  type MemberFilters,
  type MemberSortKey,
} from "@/lib/member-filters";

// En-tête de colonne triable : un lien qui change « ?tri=…&ordre=… » et garde les filtres.
// Sans « page » dans l'adresse : changer le tri ramène à la page 1.
// aria-sort annonce le sens du tri aux lecteurs d'écran ; la flèche le montre aux yeux.
export function SortableHead({
  label,
  sortKey,
  filters,
}: {
  label: string;
  sortKey: MemberSortKey;
  filters: MemberFilters;
}) {
  const active = filters.sort.key === sortKey;
  const direction = filters.sort.direction;
  const href = `/membres${buildMembersQuery({ ...filters, sort: nextMemberSort(filters.sort, sortKey) })}`;
  const Icon = !active ? ChevronsUpDown : direction === "asc" ? ArrowUp : ArrowDown;

  return (
    <TableHead aria-sort={!active ? "none" : direction === "asc" ? "ascending" : "descending"}>
      <Link
        href={href}
        className="inline-flex items-center gap-1 rounded font-bold hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {label}
        <Icon aria-hidden="true" className={active ? "size-3.5" : "size-3.5 opacity-40"} />
      </Link>
    </TableHead>
  );
}
