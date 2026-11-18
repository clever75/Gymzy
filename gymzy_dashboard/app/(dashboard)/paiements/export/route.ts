// Export CSV du journal des paiements (WEB-05).
// Le groupe (dashboard) n'apparaît pas dans l'adresse : /paiements/export.
// Un layout ne s'applique pas à une route : ici, rien d'affiché, un fichier.
import type { NextRequest } from "next/server";
import { buildCsv } from "@/lib/csv";
import { formatDateNumeric, formatTime } from "@/lib/format";
import {
  paymentMethodLabels,
  paymentStatusLabels,
  paymentTypeLabels,
} from "@/lib/labels";
import { listPaymentsForExport } from "@/lib/data/payments";
import { getNow } from "@/lib/mock/clock";
import { PAYMENT_EXPORT_HEADERS, paymentsToCsvRows } from "@/lib/payment-export";
import { parsePaymentFilters } from "@/lib/payment-filters";
import { canExportPayments } from "@/lib/permissions";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  // 1. Le rôle est vérifié ICI, côté serveur. Cacher le bouton ne suffit pas :
  //    quelqu'un peut taper l'adresse à la main.
  const { role } = await getSession();
  if (!canExportPayments(role)) {
    return new Response("Accès refusé : export réservé à l'administrateur.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // 2. Mêmes filtres que la page, lus par la même fonction : le fichier
  //    correspond à ce qu'on voit. Pas de pagination : toutes les lignes filtrées.
  const filters = parsePaymentFilters(
    Object.fromEntries(request.nextUrl.searchParams),
  );
  const payments = await listPaymentsForExport(filters);

  // 3. Les vrais libellés et formats, injectés dans la fonction pure.
  const rows = paymentsToCsvRows(payments, {
    typeLabel: (type) => paymentTypeLabels[type],
    methodLabel: (method) => paymentMethodLabels[method],
    statusLabel: (status) => paymentStatusLabels[status].label,
    date: formatDateNumeric,
    time: formatTime,
  });
  const csv = buildCsv(PAYMENT_EXPORT_HEADERS, rows);

  // 4. Nom de fichier fabriqué par nous (date seulement), jamais à partir
  //    de ce que l'utilisateur tape dans l'adresse.
  const filename = `paiements-${getNow().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      // Données financières : ni cache navigateur, ni cache intermédiaire.
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}