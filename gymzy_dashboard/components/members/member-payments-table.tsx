import { Badge } from "@/components/ui/badge";
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
import { ReceiptCell } from "@/components/payments/receipt-cell";
import { formatDate, formatFcfa, formatTime } from "@/lib/format";
import { paymentMethodLabels, paymentStatusLabels, paymentTypeLabels } from "@/lib/labels";
import { buildMemberPaymentsHref } from "@/lib/member-detail";
import type { Page } from "@/lib/paginate";
import type { Payment } from "@/lib/types";

// « Espèces · Akua » : le mode, plus l'encaisseur quand il y en a un (espèces seulement).
// Même présentation que l'onglet « Abonnements ».
function methodText(payment: Payment): string {
  const method = paymentMethodLabels[payment.method];
  return payment.confirmedBy ? `${method} · ${payment.confirmedBy}` : method;
}

// Onglet « Paiements » de la fiche (WEB-03) : toutes les transactions du membre, la plus récente en haut.
// Contrairement à « Abonnements » (périodes payées), les paiements échoués ou en attente y figurent aussi.
export function MemberPaymentsTable({ memberId, result }: { memberId: string; result: Page<Payment> }) {
  return (
    <div className="flex flex-col gap-4">
      <Table aria-label="Paiements du membre">
        <TableHeader>
          <TableRow>
            <TableHead>Date</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className="text-right">Montant</TableHead>
            <TableHead className="text-right">Réduction</TableHead>
            <TableHead>Mode</TableHead>
            <TableHead>Statut</TableHead>
            <TableHead>Reçu</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {result.items.length === 0 ? (
            <TableEmpty colSpan={7}>Aucun paiement pour ce membre.</TableEmpty>
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
                  <TableCell className="whitespace-nowrap">{paymentTypeLabels[payment.type]}</TableCell>
                  <TableCell className="text-right whitespace-nowrap tabular-nums">
                    {formatFcfa(payment.amountFinal)}
                  </TableCell>
                  <TableCell className="text-right whitespace-nowrap tabular-nums">
                    {payment.discount > 0 ? formatFcfa(payment.discount) : ""}
                  </TableCell>
                  <TableCell className="whitespace-nowrap">{methodText(payment)}</TableCell>
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
        buildHref={(n) => buildMemberPaymentsHref(memberId, n)}
      />
    </div>
  );
}
