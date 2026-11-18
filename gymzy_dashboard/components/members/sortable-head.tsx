import { SortLinkHead } from "@/components/ui/sort-link-head";
import {
  buildMembersQuery,
  nextMemberSort,
  type MemberFilters,
  type MemberSortKey,
} from "@/lib/member-filters";

// En-tête triable de la liste des membres : calcule l'adresse du tri suivant
// (« ?tri=…&ordre=… ») en gardant les filtres.
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
  const href = `/membres${buildMembersQuery({ ...filters, sort: nextMemberSort(filters.sort, sortKey) })}`;
  return (
    <SortLinkHead label={label} href={href} direction={active ? filters.sort.direction : null} />
  );
}
