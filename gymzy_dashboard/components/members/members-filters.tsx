import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChipLink } from "@/components/ui/chip-link";
import { Input } from "@/components/ui/input";
import { memberFilterLabels } from "@/lib/labels";
import {
  activeMemberFilterParams,
  buildMembersQuery,
  type MemberFilters,
  type MemberStatusFilter,
} from "@/lib/member-filters";

const STATUS_OPTIONS = Object.keys(memberFilterLabels) as MemberStatusFilter[];

export function MembersFilters({ filters }: { filters: MemberFilters }) {
  // Adresse qui change UN filtre et garde les autres. Sans « page » : retour à la page 1.
  const href = (change: Partial<MemberFilters>) =>
    `/membres${buildMembersQuery({ ...filters, ...change })}`;
  const hasActiveFilters = buildMembersQuery(filters) !== "";

  return (
    <div className="flex flex-col gap-4">
      {/* Formulaire GET : fonctionne avec Entrée, et recopie le statut actif. */}
      <form action="/membres" method="get" role="search" className="flex flex-wrap gap-3">
        {activeMemberFilterParams(filters).map(([name, value]) => (
          <input key={name} type="hidden" name={name} value={value} />
        ))}
        <Input
          type="search"
          name="q"
          defaultValue={filters.q}
          placeholder="Nom ou téléphone"
          aria-label="Rechercher un membre par nom ou téléphone"
          autoComplete="off"
          maxLength={60}
          className="max-w-sm"
        />
        <Button type="submit">Rechercher</Button>
      </form>

      <div role="group" aria-label="Statut" className="flex flex-wrap items-center gap-2">
        <span className="mr-1 text-sm font-bold text-foreground-muted">Statut</span>
        <ChipLink href={href({ status: null })} active={filters.status === null}>
          Tous
        </ChipLink>
        {STATUS_OPTIONS.map((status) => (
          <ChipLink key={status} href={href({ status })} active={filters.status === status}>
            {memberFilterLabels[status]}
          </ChipLink>
        ))}
      </div>

      {hasActiveFilters && (
        <Link href="/membres" className="w-fit text-sm font-bold text-primary underline">
          Réinitialiser les filtres
        </Link>
      )}
    </div>
  );
}