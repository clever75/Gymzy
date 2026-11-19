import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { EllipsisVertical } from "lucide-react";
import { MemberFamilyTable } from "@/components/members/member-family-table";
import { MemberPaymentsTable } from "@/components/members/member-payments-table";
import { MemberTabs } from "@/components/members/member-tabs";
import { SubscriptionPeriodsTable } from "@/components/members/subscription-periods-table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { getMemberDetail, getMemberFamily } from "@/lib/data/members";
import { listMemberPayments } from "@/lib/data/payments";
import { formatDate, formatFcfa } from "@/lib/format";
import { memberStatusLabels } from "@/lib/labels";
import { formatMemberName, isChild } from "@/lib/member-display";
import { memberTabLabels, parseMemberTab } from "@/lib/member-detail";
import { parsePageParam } from "@/lib/paginate";

export const metadata: Metadata = { title: "Fiche membre · Gymzy" };

// Actions de la maquette (Renouveler, Modifier, ⋮) : ce sont des écritures, qui ont besoin de l'API
// (paiement, règles ABO-03 et ABO-05). Affichées mais désactivées : pas de faux renouvellement.
const NOT_AVAILABLE = "Disponible avec le branchement à l'API";

// Dans Next.js 16, params et searchParams sont des promesses : la page est donc « async ».
export default async function MemberPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { id } = await params;
  const member = await getMemberDetail(id);
  if (!member) notFound();

  const query = await searchParams;
  const tab = parseMemberTab(query.onglet);
  const status = memberStatusLabels[member.displayStatus];

  // Les paiements et la famille ne sont lus que si leur onglet est ouvert : les autres onglets ne paient pas cet appel.
  const payments = tab === "paiements" ? await listMemberPayments(member.id, parsePageParam(query.page)) : null;
  const family = tab === "famille" ? await getMemberFamily(member.id) : null;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <Link href="/membres" className="w-fit text-sm font-bold text-primary underline">
            ‹ Membres
          </Link>
          <h1 className="text-2xl">
            {formatMemberName(member)}
            {isChild(member) && <span className="ml-2 text-base text-foreground-muted">(enfant)</span>}
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <Button disabled title={NOT_AVAILABLE}>
            Renouveler
          </Button>
          <Button variant="outline" disabled title={NOT_AVAILABLE}>
            Modifier
          </Button>
          <Button variant="outline" size="md" disabled title={NOT_AVAILABLE} aria-label="Autres actions">
            <EllipsisVertical aria-hidden="true" className="size-4" />
          </Button>
        </div>
      </header>

      {/* Bandeau : l'essentiel de l'abonnement courant. */}
      <dl
        aria-label="Abonnement courant"
        className="grid gap-4 rounded-2xl border border-border bg-surface p-5 sm:grid-cols-2 xl:grid-cols-4"
      >
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-foreground-muted">Statut</dt>
          <dd>
            <Badge variant={status.tone}>{status.label}</Badge>
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-foreground-muted">Fin de période</dt>
          <dd className="font-bold">{member.endDate ? formatDate(member.endDate) : "—"}</dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-foreground-muted">Prix convenu</dt>
          <dd className="font-bold tabular-nums">
            {member.agreedPrice !== null ? formatFcfa(member.agreedPrice) : "—"}
          </dd>
        </div>
        <div className="flex flex-col gap-1">
          <dt className="text-sm text-foreground-muted">Carte</dt>
          <dd className="font-bold">{member.cardNumber ?? "—"}</dd>
        </div>
      </dl>

      <MemberTabs memberId={member.id} active={tab} />

      <section aria-label={memberTabLabels[tab]}>
        {tab === "abonnements" ? (
          <SubscriptionPeriodsTable periods={member.periods} />
        ) : payments ? (
          <MemberPaymentsTable memberId={member.id} result={payments} />
        ) : family ? (
          <MemberFamilyTable family={family} />
        ) : (
          <p className="rounded-2xl border border-border bg-surface px-4 py-10 text-center text-foreground-muted">
            Onglet « {memberTabLabels[tab]} » à construire.
          </p>
        )}
      </section>
    </div>
  );
}