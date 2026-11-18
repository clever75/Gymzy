import Link from "next/link";
import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { ChipLink } from "@/components/ui/chip-link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import {
  paymentMethodLabels,
  paymentTypeLabels,
  periodLabels,
  statusFilterLabels,
} from "@/lib/labels";
import {
  PERIODS,
  activeFilterParams,
  buildPaymentsQuery,
  type PaymentFilters,
  type StatusFilter,
} from "@/lib/payment-filters";
import type { PaymentMethod, PaymentType } from "@/lib/types";

const METHOD_OPTIONS = Object.keys(paymentMethodLabels) as PaymentMethod[];
const STATUS_OPTIONS = Object.keys(statusFilterLabels) as StatusFilter[];
const TYPE_OPTIONS = Object.keys(paymentTypeLabels) as PaymentType[];

function ChipGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap items-center gap-2">
      <span className="mr-1 text-sm font-bold text-foreground-muted">{label}</span>
      {children}
    </div>
  );
}

export function PaymentsFilters({
  filters,
  collectors,
}: {
  filters: PaymentFilters;
  // Noms des encaisseurs, calculés sur tous les paiements (listCollectors).
  collectors: string[];
}) {
  // Adresse qui change UN filtre et garde les autres. Sans « page » : retour à la page 1.
  const href = (change: Partial<PaymentFilters>) =>
    `/paiements${buildPaymentsQuery({ ...filters, ...change })}`;
  const hasActiveFilters = buildPaymentsQuery(filters) !== "";

  // Le formulaire « encaisseur » recopie les autres filtres et la recherche ;
  // « encaisse » est exclu : c'est la liste déroulante qui l'envoie.
  const collectorFormParams: [string, string][] = activeFilterParams({
    ...filters,
    collector: null,
  });
  if (filters.q) collectorFormParams.push(["q", filters.q]);

  // Un nom tapé à la main dans l'adresse reste visible dans la liste.
  const collectorOptions =
    filters.collector !== null && !collectors.includes(filters.collector)
      ? [filters.collector, ...collectors]
      : collectors;

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

      <ChipGroup label="Type">
        <ChipLink href={href({ type: null })} active={filters.type === null}>
          Tous les types
        </ChipLink>
        {TYPE_OPTIONS.map((type) => (
          <ChipLink key={type} href={href({ type })} active={filters.type === type}>
            {paymentTypeLabels[type]}
          </ChipLink>
        ))}
      </ChipGroup>

      <form action="/paiements" method="get" className="flex flex-wrap items-center gap-2">
        {collectorFormParams.map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <label htmlFor="filtre-encaisse" className="mr-1 text-sm font-bold text-foreground-muted">
          Encaisseur
        </label>
        <Select id="filtre-encaisse" name="encaisse" defaultValue={filters.collector ?? ""}>
          <option value="">Tous les encaisseurs</option>
          {collectorOptions.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </Select>
        <Button type="submit">Appliquer</Button>
      </form>

      {hasActiveFilters && (
        <Link href="/paiements" className="w-fit text-sm font-bold text-primary underline">
          Réinitialiser les filtres
        </Link>
      )}
    </div>
  );
}