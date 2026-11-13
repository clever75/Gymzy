// Filtres et totaux du journal des paiements (WEB-05, PAY-09, PAY-10).
// Fonctions pures, sans import d'exécution : elles se testent avec Node.
import type { Payment, PaymentMethod } from "./types";

// ── Périodes ────────────────────────────────────────────────────────────
export const PERIODS = ["jour", "7j", "mois", "tout"] as const;
export type Period = (typeof PERIODS)[number];

// ── Valeurs de l'adresse <-> valeurs de l'API ───────────────────────────
// [texte dans l'URL, valeur de l'API]. Des tableaux et non des objets :
// un objet répondrait aussi à "constructor" ou "__proto__".
const METHODS = [
  ["especes", "CASH"],
  ["mobile-money", "MOBILE_MONEY"],
  ["carte", "CARD"],
] as const;

// « En attente » regroupe PENDING et PROCESSING (pas encore confirmé).
const STATUSES = [
  ["payes", "COMPLETED"],
  ["en-attente", "PENDING"],
  ["echoues", "FAILED"],
] as const;
export type StatusFilter = (typeof STATUSES)[number][1];

export interface PaymentFilters {
  period: Period;
  method: PaymentMethod | null;
  status: StatusFilter | null;
  q: string;
}

export const DEFAULT_PAYMENT_FILTERS: PaymentFilters = {
  period: "mois",
  method: null,
  status: null,
  q: "",
};

const MAX_QUERY_LENGTH = 60;

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// Lit les filtres dans l'adresse. Toute valeur inconnue donne la valeur par défaut.
export function parsePaymentFilters(params: SearchParams): PaymentFilters {
  const rawPeriod = firstValue(params.periode);
  const rawMode = firstValue(params.mode);
  const rawStatus = firstValue(params.statut);

  return {
    period: PERIODS.find((p) => p === rawPeriod) ?? DEFAULT_PAYMENT_FILTERS.period,
    method: METHODS.find(([slug]) => slug === rawMode)?.[1] ?? null,
    status: STATUSES.find(([slug]) => slug === rawStatus)?.[1] ?? null,
    q: (firstValue(params.q) ?? "").trim().slice(0, MAX_QUERY_LENGTH),
  };
}

// Construit la partie « ?… » de l'adresse. Les valeurs par défaut sont omises.
export function buildPaymentsQuery(filters: PaymentFilters, page = 1): string {
  const qs = new URLSearchParams();
  if (filters.period !== DEFAULT_PAYMENT_FILTERS.period) qs.set("periode", filters.period);
  const mode = METHODS.find(([, value]) => value === filters.method)?.[0];
  if (mode) qs.set("mode", mode);
  const statut = STATUSES.find(([, value]) => value === filters.status)?.[0];
  if (statut) qs.set("statut", statut);
  if (filters.q) qs.set("q", filters.q);
  if (page > 1) qs.set("page", String(page));
  const text = qs.toString();
  return text ? `?${text}` : "";
}

// ── Périodes -> intervalle de dates ─────────────────────────────────────
const DAY_MS = 86_400_000;

// Intervalle [from, to[ en millisecondes, ou null pour « tout ».
// Les jours sont découpés en UTC : Lomé est en UTC+0 (comme lib/format.ts).
// À rendre configurable par salle plus tard.
export function periodRange(
  period: Period,
  now: Date,
): { from: number; to: number } | null {
  const year = now.getUTCFullYear();
  const month = now.getUTCMonth();
  const dayStart = Date.UTC(year, month, now.getUTCDate());

  switch (period) {
    case "jour":
      return { from: dayStart, to: dayStart + DAY_MS };
    case "7j": // aujourd'hui et les 6 jours précédents
      return { from: dayStart - 6 * DAY_MS, to: dayStart + DAY_MS };
    case "mois": // mois calendaire en cours
      return { from: Date.UTC(year, month, 1), to: Date.UTC(year, month + 1, 1) };
    case "tout":
      return null;
  }
}

export function paymentsInPeriod(payments: Payment[], period: Period, now: Date): Payment[] {
  const range = periodRange(period, now);
  if (!range) return payments;
  return payments.filter((p) => {
    const time = new Date(p.createdAt).getTime();
    return time >= range.from && time < range.to;
  });
}

// ── Filtrage ────────────────────────────────────────────────────────────
// Recherche sans accent ni majuscule : « dogbe » trouve « Dogbé ».
function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function matchesStatus(payment: Payment, status: StatusFilter | null): boolean {
  if (status === null) return true;
  if (status === "PENDING") return payment.status === "PENDING" || payment.status === "PROCESSING";
  return payment.status === status;
}

export function filterPayments(payments: Payment[], filters: PaymentFilters, now: Date): Payment[] {
  const query = normalizeText(filters.q);
  return paymentsInPeriod(payments, filters.period, now).filter(
    (p) =>
      (filters.method === null || p.method === filters.method) &&
      matchesStatus(p, filters.status) &&
      (query === "" || normalizeText(p.memberName).includes(query)),
  );
}

// ── Totaux ──────────────────────────────────────────────────────────────
export interface PaymentTotals {
  collected: number; // total encaissé = cash + online
  cash: number; // espèces
  online: number; // mobile money + carte
  discounts: number; // réductions accordées
}

// Seuls les paiements confirmés (COMPLETED) comptent comme encaissés.
export function computePaymentTotals(payments: Payment[]): PaymentTotals {
  const totals: PaymentTotals = { collected: 0, cash: 0, online: 0, discounts: 0 };
  for (const p of payments) {
    if (p.status !== "COMPLETED") continue;
    totals.collected += p.amountFinal;
    if (p.method === "CASH") totals.cash += p.amountFinal;
    else totals.online += p.amountFinal;
    totals.discounts += p.discount;
  }
  return totals;
}