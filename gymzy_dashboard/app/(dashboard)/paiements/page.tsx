import type { Metadata } from "next";
import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import { Pagination } from "@/components/ui/pagination";
import { StatCard } from "@/components/ui/stat-card";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatFcfa, formatTime } from "@/lib/format";
import {
  paymentMethodLabels,
  paymentStatusLabels,
  paymentTypeLabels,
  periodLabels,
} from "@/lib/labels";
import { getPaymentCollectors, listPayments } from "@/lib/data/payments";
import { parsePageParam } from "@/lib/paginate";
import { buildPaymentsQuery, parsePaymentFilters } from "@/lib/payment-filters";
import { PaymentsFilters } from "@/components/payments/payments-filters";
import { ReceiptCell } from "@/components/payments/receipt-cell";
import { SortableHead } from "@/components/payments/sortable-head";
import { ExportPaymentsButton } from "@/components/payments/export-payments-button";
import { canExportPayments } from "@/lib/permissions";
import { getSession } from "@/lib/session";

export const metadata: Metadata = { title: "Paiements · Gymzy" };

// Dans Next.js 16, searchParams est une promesse : la page est donc « async ».
export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parsePaymentFilters(params);

  // Sur tous les paiements (pas les filtrés) : la liste ne rétrécit pas quand on filtre.
  const collectors = await getPaymentCollectors();

  // Confort d'affichage seulement : la route d'export refuse elle-même (403).
  const { role } = await getSession();
  const canExport = canExportPayments(role);

  // Les totaux portent sur toutes les pages (pas seulement la page affichée).
  const result = await listPayments(filters, parsePageParam(params.page));
  const totals = result.totals;

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div className="flex flex-col gap-1">
          <h1 className="text-2xl">Paiements et recettes</h1>
          <p className="text-foreground-muted">{periodLabels[filters.period]}</p>
        </div>
        {canExport && <ExportPaymentsButton filters={filters} />}
      </header>

      <PaymentsFilters filters={filters} collectors={collectors} />

      <section
        aria-label="Totaux des paiements affichés"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5"
      >
        <StatCard highlight label="Total encaissé" value={formatFcfa(totals.collected)} />
        <StatCard label="Espèces" value={formatFcfa(totals.cash)} />
        <StatCard label="Mobile money" value={formatFcfa(totals.mobileMoney)} />
        <StatCard label="Carte" value={formatFcfa(totals.card)} />
        <StatCard
          label="Réductions"
          value={formatFcfa(totals.discounts)}
          hint="Accordées sur ces paiements"
        />
      </section>

      <section aria-label="Journal des paiements" className="flex flex-col gap-4">
        {/* Neuf colonnes (maquette WEB-05) : espacement réduit pour tenir à 1280 px sans défilement.
            En dessous, la table défile à l'intérieur de son cadre (utilisable dès 768 px). */}
        <Table aria-label="Journal des paiements" className="[&_td]:px-3 [&_th]:px-3">
          <TableHeader>
            <TableRow>
              <SortableHead label="Date" sortKey="createdAt" filters={filters} />
              <SortableHead label="Membre" sortKey="memberName" filters={filters} />
              <TableHead>Type</TableHead>
              <SortableHead
                label="Montant"
                sortKey="amountFinal"
                filters={filters}
                className="text-right"
              />
              <TableHead className="text-right">Réduction</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead>Encaisseur</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Reçu</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length === 0 ? (
              <TableEmpty colSpan={9}>
                <p>Aucun paiement pour ces filtres.</p>
                <Link href="/paiements" className="mt-2 inline-block font-bold text-primary underline">
                  Réinitialiser les filtres
                </Link>
              </TableEmpty>
            ) : (
              result.items.map((payment) => {
                const status = paymentStatusLabels[payment.status];
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="whitespace-nowrap">
                      {formatDate(payment.createdAt)}
                      <span className="block text-xs text-foreground-muted">
                        {formatTime(payment.createdAt)}
                      </span>
                    </TableCell>
                    {/* Pas de « nowrap » : un nom long peut passer sur deux lignes si la place manque. */}
                    <TableCell>{payment.memberName}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {paymentTypeLabels[payment.type]}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap tabular-nums">
                      {formatFcfa(payment.amountFinal)}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap tabular-nums">
                      {payment.discount > 0 ? formatFcfa(payment.discount) : ""}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {paymentMethodLabels[payment.method]}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {payment.confirmedBy ?? "—"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.tone}>{status.label}</Badge>
                    </TableCell>
                    <TableCell>
                      <ReceiptCell status={payment.status} />
                    </TableCell>
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
          buildHref={(n) => `/paiements${buildPaymentsQuery(filters, n)}`}
        />
      </section>
    </div>
  );
}
