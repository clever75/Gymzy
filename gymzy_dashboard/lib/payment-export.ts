// Transformation des paiements en lignes de tableau pour l'export CSV (WEB-05).
// Fonction pure, sans import d'exécution : les libellés et les formats de date
// sont fournis par l'appelant (voir PaymentExportContext), ce qui la rend
// testable avec Node, sans Next.js.
import type { Payment, PaymentMethod, PaymentStatus, PaymentType } from "./types";

// Une colonne par information utile. Le (F) évite de coller « F » aux montants,
// qui restent des nombres que le tableur sait additionner.
export const PAYMENT_EXPORT_HEADERS = [
  "Date",
  "Heure",
  "Membre",
  "Type",
  "Mode",
  "Montant initial (F)",
  "Réduction (F)",
  "Montant payé (F)",
  "Statut",
  "Encaissé par",
];

// Ce que la fonction ne sait pas faire seule : traduire et formater.
export interface PaymentExportContext {
  typeLabel: (type: PaymentType) => string;
  methodLabel: (method: PaymentMethod) => string;
  statusLabel: (status: PaymentStatus) => string;
  date: (iso: string) => string; // ex. "28/10/2026"
  time: (iso: string) => string; // ex. "10:42"
}

// L'ordre des valeurs doit suivre exactement PAYMENT_EXPORT_HEADERS.
export function paymentsToCsvRows(
  payments: Payment[],
  context: PaymentExportContext,
): (string | number)[][] {
  return payments.map((p) => [
    context.date(p.createdAt),
    context.time(p.createdAt),
    p.memberName,
    context.typeLabel(p.type),
    context.methodLabel(p.method),
    p.amountOriginal,
    p.discount,
    p.amountFinal,
    context.statusLabel(p.status),
    p.confirmedBy ?? "", // cellule vide, pas le texte « null »
  ]);
}