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
import { getNow } from "@/lib/mock/clock";
import { mockPayments } from "@/lib/mock/payments";
import { PAGE_SIZE, paginate, parsePageParam } from "@/lib/paginate";
import {
  buildPaymentsQuery,
  computePaymentTotals,
  filterPayments,
  parsePaymentFilters,
  paymentsInPeriod,
} from "@/lib/payment-filters";
import { PaymentsFilters } from "@/components/payments/payments-filters";
export const metadata: Metadata = { title: "Paiements · Gymzy" };

// Dans Next.js 16, searchParams est une promesse : la page est donc « async ».
export default async function PaymentsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const params = await searchParams;
  const filters = parsePaymentFilters(params);
  const now = getNow();

  // Les totaux suivent la période seulement ; le tableau suit tous les filtres.
  const totals = computePaymentTotals(paymentsInPeriod(mockPayments, filters.period, now));
  const filtered = filterPayments(mockPayments, filters, now);
  const result = paginate(filtered, parsePageParam(params.page), PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-1">
        <h1 className="text-2xl">Paiements et recettes</h1>
        <p className="text-foreground-muted">{periodLabels[filters.period]}</p>
      </header>
            <PaymentsFilters filters={filters} />

      <section
        aria-label="Totaux de la période"
        className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4"
      >
        <StatCard highlight label="Total encaissé" value={formatFcfa(totals.collected)} />
        <StatCard label="Espèces" value={formatFcfa(totals.cash)} />
        <StatCard
          label="En ligne"
          value={formatFcfa(totals.online)}
          hint="Mobile money et carte"
        />
        <StatCard
          label="Réductions"
          value={formatFcfa(totals.discounts)}
          hint="Accordées sur la période"
        />
      </section>

      <section aria-label="Journal des paiements" className="flex flex-col gap-4">
        <Table aria-label="Journal des paiements">
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Membre</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Mode</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead>Statut</TableHead>
              <TableHead>Encaissé par</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {result.items.length === 0 ? (
              <TableEmpty colSpan={7}>
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
                    <TableCell className="whitespace-nowrap">{payment.memberName}</TableCell>
                    <TableCell className="whitespace-nowrap">
                      {paymentTypeLabels[payment.type]}
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {paymentMethodLabels[payment.method]}
                    </TableCell>
                    <TableCell className="text-right whitespace-nowrap tabular-nums">
                      {formatFcfa(payment.amountFinal)}
                      {payment.discount > 0 && (
                        <span className="block text-xs text-foreground-muted">
                          réduction {formatFcfa(payment.discount)}
                        </span>
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge variant={status.tone}>{status.label}</Badge>
                    </TableCell>
                    <TableCell className="whitespace-nowrap">
                      {payment.confirmedBy ?? "—"}
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