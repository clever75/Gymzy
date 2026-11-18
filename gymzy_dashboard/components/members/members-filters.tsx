import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ChipLink } from "@/components/ui/chip-link";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { memberFilterLabels } from "@/lib/labels";
import {
  activeMemberFilterParams,
  buildMembersQuery,
  type MemberFilterOptions,
  type MemberFilters,
  type MemberStatusFilter,
} from "@/lib/member-filters";

const STATUS_OPTIONS = Object.keys(memberFilterLabels) as MemberStatusFilter[];

// Liste déroulante d'un filtre. Si l'adresse contient une valeur absente de la liste
// (lien ancien ou modifié), on l'ajoute pour que le filtre actif reste visible.
function FilterSelect({
  id,
  name,
  label,
  allLabel,
  value,
  options,
}: {
  id: string;
  name: string;
  label: string;
  allLabel: string;
  value: string | null;
  options: string[];
}) {
  const shown = value !== null && !options.includes(value) ? [value, ...options] : options;
  return (
    <div className="flex flex-col gap-1">
      <label htmlFor={id} className="text-sm font-bold text-foreground-muted">
        {label}
      </label>
      <Select id={id} name={name} defaultValue={value ?? ""}>
        <option value="">{allLabel}</option>
        {shown.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </Select>
    </div>
  );
}

export function MembersFilters({
  filters,
  options,
}: {
  filters: MemberFilters;
  options: MemberFilterOptions;
}) {
  // Adresse qui change UN filtre et garde les autres. Sans « page » : retour à la page 1.
  const href = (change: Partial<MemberFilters>) =>
    `/membres${buildMembersQuery({ ...filters, ...change })}`;
  const hasActiveFilters = buildMembersQuery(filters) !== "";

  return (
    <div className="flex flex-col gap-4">
      {/* Un seul formulaire GET : recherche et listes déroulantes partent ensemble
          (Entrée fonctionne). Le statut (puce) et le tri (en-têtes) sont recopiés en champs cachés. */}
      <form action="/membres" method="get" role="search" className="flex flex-col gap-3">
        {activeMemberFilterParams(filters)
          .filter(([name]) => name === "statut" || name === "tri" || name === "ordre")
          .map(([name, value]) => (
            <input key={name} type="hidden" name={name} value={value} />
          ))}
        <div className="flex flex-wrap gap-3">
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
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <FilterSelect
            id="filtre-activite"
            name="activite"
            label="Activité"
            allLabel="Toutes les activités"
            value={filters.activity}
            options={options.activities}
          />
          <FilterSelect
            id="filtre-formule"
            name="formule"
            label="Formule"
            allLabel="Toutes les formules"
            value={filters.formula}
            options={options.formulas}
          />
          <FilterSelect
            id="filtre-coach"
            name="coach"
            label="Coach"
            allLabel="Tous les coachs"
            value={filters.coach}
            options={options.coaches}
          />
          <Button type="submit" variant="outline">
            Appliquer
          </Button>
        </div>
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