import { SortLinkHead } from "@/components/ui/sort-link-head";
import {
  buildPaymentsQuery,
  nextPaymentSort,
  type PaymentFilters,
  type PaymentSortKey,
} from "@/lib/payment-filters";

// En-tête triable du journal des paiements : calcule l'adresse du tri suivant
// (« ?tri=…&ordre=… ») en gardant les filtres.
export function SortableHead({
  label,
  sortKey,
  filters,
  className,
}: {
  label: string;
  sortKey: PaymentSortKey;
  filters: PaymentFilters;
  className?: string;
}) {
  const active = filters.sort.key === sortKey;
  const href = `/paiements${buildPaymentsQuery({ ...filters, sort: nextPaymentSort(filters.sort, sortKey) })}`;
  return (
    <SortLinkHead
      label={label}
      href={href}
      direction={active ? filters.sort.direction : null}
      className={className}
    />
  );
}
