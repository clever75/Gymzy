import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { formatDate, formatDateShort, formatFcfa } from "@/lib/format";
import { paymentMethodLabels } from "@/lib/labels";
import { formatPeriodRange } from "@/lib/member-detail";
import type { SubscriptionPeriod } from "@/lib/types";

// Le reçu PDF dépend de l'API (PAY-07) : bouton affiché mais désactivé, comme dans le journal des paiements.
const NOT_AVAILABLE = "Disponible avec le branchement à l'API";

// « Espèces · Akua » : le mode, plus l'encaisseur quand il y en a un (espèces seulement).
function methodText(period: SubscriptionPeriod): string {
  const method = paymentMethodLabels[period.method];
  return period.confirmedBy ? `${method} · ${period.confirmedBy}` : method;
}

// Onglet « Abonnements » (ABO-09) : une ligne par période payée, la plus récente en haut.
export function SubscriptionPeriodsTable({ periods }: { periods: SubscriptionPeriod[] }) {
  return (
    <Table aria-label="Historique des périodes d'abonnement">
      <TableHeader>
        <TableRow>
          <TableHead>Période</TableHead>
          <TableHead>Formule</TableHead>
          <TableHead>Payé par</TableHead>
          <TableHead className="text-right">Montant</TableHead>
          <TableHead>Mode</TableHead>
          <TableHead>Reçu</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {periods.length === 0 ? (
          <TableEmpty colSpan={6}>Aucune période payée pour l&apos;instant.</TableEmpty>
        ) : (
          periods.map((period) => (
            <TableRow key={period.id}>
              <TableCell className="whitespace-nowrap">
                {formatPeriodRange(period.startDate, period.endDate, {
                  date: formatDate,
                  dateShort: formatDateShort,
                })}
              </TableCell>
              <TableCell className="whitespace-nowrap">{period.formula}</TableCell>
              <TableCell>{period.paidByName}</TableCell>
              <TableCell className="text-right whitespace-nowrap tabular-nums">
                {formatFcfa(period.amount)}
              </TableCell>
              <TableCell className="whitespace-nowrap">{methodText(period)}</TableCell>
              <TableCell>
                {period.paymentId ? (
                  <Button variant="outline" size="sm" disabled title={NOT_AVAILABLE} className="px-2">
                    PDF
                  </Button>
                ) : (
                  <span aria-label="Aucun reçu">—</span>
                )}
              </TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}
