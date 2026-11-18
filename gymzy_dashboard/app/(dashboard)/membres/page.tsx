import type { Metadata } from "next";
import Link from "next/link";
import { Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { ExportMembersButton } from "@/components/members/export-members-button";
import { MembersFilters } from "@/components/members/members-filters";
import { listMembers } from "@/lib/data/members";
import { formatDate } from "@/lib/format";
import { memberStatusLabels } from "@/lib/labels";
import { formatMemberName, isChild } from "@/lib/member-display";
import { buildMembersQuery, parseMemberFilters } from "@/lib/member-filters";
import { parsePageParam } from "@/lib/paginate";
import { canExportMembers } from "@/lib/permissions";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Membres · Gymzy" };

// Dans Next.js 16, searchParams est une promesse : la page est donc « async ».
export default async function MembersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parseMemberFilters(params);

  // Confort d'affichage seulement : la route d'export refuse elle-même (403).
  const { role } = await getSession();
  const canExport = canExportMembers(role);

  // La page ne filtre plus, ne pagine plus et ne calcule plus la date du jour :
  // tout cela est fait par la couche d'accès (ADR 0002).
  const result = await listMembers(filters, parsePageParam(params.page));

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <h1 className="text-2xl">
          Membres <span className="text-foreground-muted tabular-nums">({result.totalAll})</span>
        </h1>
        <div className="flex flex-wrap items-center gap-3">
          {/* Vers l'écran d'inscription (placeholder pour l'instant). */}
          <Link href="/membres/nouveau" className={buttonVariants()}>
            <Plus aria-hidden="true" className="size-4" />
            Inscrire
          </Link>
          {canExport && <ExportMembersButton filters={filters} />}
        </div>
      </header>

      <MembersFilters filters={filters} />

      <section aria-label="Liste des membres" className="flex flex-col gap-4">
        <Table aria-label="Liste des membres">
          <TableHeader>
            <TableRow>
              <TableHead>Membre</TableHead>
              <TableHead>Téléphone</TableHead>
              <TableHead>Activité · Formule</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Fin</TableHead>
              <TableHead>Coach</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length === 0 ? (
              <TableEmpty colSpan={6}>
                <p>Aucun membre pour ces filtres.</p>
                <Link href="/membres" className="mt-2 inline-block font-bold text-primary underline">
                  Réinitialiser les filtres
                </Link>
              </TableEmpty>
            ) : (
              result.items.map((member, index) => {
                const status = memberStatusLabels[member.displayStatus];
                return (
                  <TableRow
                    key={member.id}
                    // Apparition en cascade (animation « row-in » dans globals.css),
                    // coupée si le visiteur a demandé moins d'animations.
                    className="motion-safe:animate-row-in"
                    style={{ animationDelay: `${Math.min(index, 10) * 25}ms` }}
                  >
                    <TableCell className="whitespace-nowrap">
                      <Link
                        href={`/membres/${member.id}`}
                        className="font-bold hover:text-primary hover:underline"
                      >
                        {formatMemberName(member)}
                      </Link>
                      {isChild(member) && (
                        <span className="ml-1 text-foreground-muted">(enfant)</span>
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {member.guardianName ? (
                        <span className="text-foreground-muted">parent : {member.guardianName}</span>
                      ) : (
                        (member.phone ?? "—")
                      )}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {member.activity} · {member.formula}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.tone}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {member.endDate ? formatDate(member.endDate) : "—"}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">{member.coachName ?? "—"}</TableCell>
                  </TableRow>
                );
              })
            )}
          </TableBody>
        </Table>

        <Pagination
          page={result.page}
          totalPages={result.totalPages}
          totalItems={result.totalItems}
          pageSize={result.pageSize}
          buildHref={(n) => `/membres${buildMembersQuery(filters, n)}`}
        />
      </section>
    </div>
  );
}