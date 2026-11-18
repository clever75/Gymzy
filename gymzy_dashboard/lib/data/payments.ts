// Couche d'accès aux données des paiements (ADR 0002).
// Les pages et les routes passent par ici : elles ne lisent jamais lib/mock directement.
// Aujourd'hui les données sont factices ; au branchement de l'API, seul ce fichier change.
import { getNow } from "@/lib/mock/clock";
import { mockPayments } from "@/lib/mock/payments";
import { paginate } from "@/lib/paginate";
import type { Page } from "@/lib/paginate";
import {
  computePaymentTotals,
  filterPayments,
  listCollectors,
  sortPayments,
} from "@/lib/payment-filters";
import type { PaymentFilters, PaymentTotals } from "@/lib/payment-filters";
import type { Payment } from "@/lib/types";

/** Une page de paiements, avec les totaux de TOUTE la liste filtrée (pas de la seule page). */
export type PaymentsPage = Page<Payment> & { totals: PaymentTotals };

/** Liste filtrée et paginée. Le filtre et la page sont des paramètres, comme pour l'API. */
export async function listPayments(filters: PaymentFilters, page: number): Promise<PaymentsPage> {
  // Une seule liste filtrée alimente le tableau ET les totaux : ils ne peuvent pas diverger.
  const filtered = filterPayments(mockPayments, filters, getNow());
  // Le tri se fait AVANT la découpe en pages (sinon la page 2 serait fausse) ; il ne change pas les totaux.
  return { ...paginate(sortPayments(filtered, filters.sort), page), totals: computePaymentTotals(filtered) };
}

/** Tous les paiements filtrés, sans pagination : pour l'export. */
export async function listPaymentsForExport(filters: PaymentFilters): Promise<Payment[]> {
  return sortPayments(filterPayments(mockPayments, filters, getNow()), filters.sort);
}

/** Noms des encaisseurs de toute la salle, pour la liste déroulante (pas seulement la page). */
export async function getPaymentCollectors(): Promise<string[]> {
  return listCollectors(mockPayments);
}
