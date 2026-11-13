import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChipLink } from "@/components/ui/chip-link";
import { Input } from "@/components/ui/input";
import { paymentMethodLabels, periodLabels, statusFilterLabels } from "@/lib/labels";
import {
  PERIODS,
  activeFilterParams,
  buildPaymentsQuery,
  type PaymentFilters,
  type StatusFilter,
} from "@/lib/payment-filters";
import type { PaymentMethod } from "@/lib/types";

const METHOD_OPTIONS = Object.keys(paymentMethodLabels) as PaymentMethod[];
const STATUS_OPTIONS = Object.keys(statusFilterLabels) as StatusFilter[];

function ChipGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-bold text-foreground-muted">{label}</span>
      {children}
    </div>
  );
}

export function PaymentsFilters({ filters }: { filters: PaymentFilters }) {
  // Adresse qui change UN filtre et garde les autres. Sans « page » : retour à la page 1.
  const href = (change: Partial<PaymentFilters>) =>
    `/paiements${buildPaymentsQuery({ ...filters, ...change })}`;
  const hasActiveFilters = buildPaymentsQuery(filters) !== "";

  return (
    <div className="flex flex-col gap-4">
      {/* Formulaire GET : fonctionne avec Entrée, et recopie les filtres actifs. */}
      <form action="/paiements" method="get" role="search" className="flex flex-wrap gap-3">
        {activeFilterParams(filters).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <Input
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="Rechercher un membre"
          aria-label="Rechercher un membre"
          autoComplete="off"
          maxLength={60}
          className="max-w-sm"
        />
        <Button type="submit">Rechercher</Button>
      </form>

      <ChipGroup label="Période">
        {PERIODS.map((period) => (
          <ChipLink key={period} href={href({ period })} active={filters.period === period}>
            {periodLabels[period]}
          </ChipLink>
        ))}
      </ChipGroup>

      <ChipGroup label="Mode">
        <ChipLink href={href({ method: null })} active={filters.method === null}>
          Tous les modes
        </ChipLink>
        {METHOD_OPTIONS.map((method) => (
          <ChipLink key={method} href={href({ method })} active={filters.method === method}>
            {paymentMethodLabels[method]}
          </ChipLink>
        ))}
      </ChipGroup>

      <ChipGroup label="Statut">
        <ChipLink href={href({ status: null })} active={filters.status === null}>
          Tous
        </ChipLink>
        {STATUS_OPTIONS.map((status) => (
          <ChipLink key={status} href={href({ status })} active={filters.status === status}>
            {statusFilterLabels[status]}
          </ChipLink>
        ))}
      </ChipGroup>

      {hasActiveFilters && (
        <Link href="/paiements" className="w-fit text-sm font-bold text-primary underline">
          Réinitialiser les filtres
        </Link>
      )}
    </div>
  );
}