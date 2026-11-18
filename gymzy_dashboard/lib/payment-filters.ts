// Filtres et totaux du journal des paiements (WEB-05, PAY-09, PAY-10).
// Fonctions pures, sans import d'exécution : elles se testent avec Node.
import type { Payment, PaymentMethod, PaymentType } from "./types";

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

// Types de paiement filtrables (PAY-09). Même principe que les modes.
const TYPES = [
  ["inscription", "FIRST_SUBSCRIPTION"],
  ["renouvellement", "RENEWAL"],
  ["seance", "PER_SESSION"],
  ["billet", "EVENT_TICKET"],
] as const;

// ── Tri ─────────────────────────────────────────────────────────────────
// Colonnes triables : [texte dans l'URL, clé]. Tableaux et non objets, comme STATUSES.
// Le cahier dit seulement « tri » (PAY-09, §9) : colonnes et ordre par défaut sont notre choix
// (question ouverte).
const SORT_KEYS = [
  ["date", "createdAt"],
  ["membre", "memberName"],
  ["montant", "amountFinal"],
] as const;
export type PaymentSortKey = (typeof SORT_KEYS)[number][1];
export type SortDirection = "asc" | "desc";

export interface PaymentSort {
  key: PaymentSortKey;
  direction: SortDirection;
}

// Un journal se lit du plus récent au plus ancien.
export const DEFAULT_PAYMENT_SORT: PaymentSort = { key: "createdAt", direction: "desc" };

export interface PaymentFilters {
  period: Period;
  method: PaymentMethod | null;
  status: StatusFilter | null;
  type: PaymentType | null;
  // Nom de l'encaisseur (colonne « Encaisseur »). Texte libre : la liste
  // des personnes dépend de la salle, elle n'est pas figée dans le code.
  collector: string | null;
  q: string;
  sort: PaymentSort; // le tri voyage avec les filtres : même adresse, même fonction de lecture
}

export const DEFAULT_PAYMENT_FILTERS: PaymentFilters = {
  period: "mois",
  method: null,
  status: null,
  type: null,
  collector: null,
  q: "",
  sort: DEFAULT_PAYMENT_SORT,
};

const MAX_QUERY_LENGTH = 60;

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// Lit « ?tri=…&ordre=… ». Une valeur inconnue donne l'ordre par défaut.
function parsePaymentSort(params: SearchParams): PaymentSort {
  const rawKey = firstValue(params.tri);
  const key = SORT_KEYS.find(([slug]) => slug === rawKey)?.[1];
  if (!key) return DEFAULT_PAYMENT_SORT;
  return { key, direction: firstValue(params.ordre) === "desc" ? "desc" : "asc" };
}

function samePaymentSort(a: PaymentSort, b: PaymentSort): boolean {
  return a.key === b.key && a.direction === b.direction;
}

// Sens du premier clic sur une colonne : la date commence par le plus récent
// (c'est déjà l'ordre par défaut), les autres colonnes par « croissant ».
const FIRST_DIRECTION: Record<PaymentSortKey, SortDirection> = {
  createdAt: "desc",
  memberName: "asc",
  amountFinal: "asc",
};

// Tri à appliquer quand on clique sur l'en-tête d'une colonne :
// autre colonne -> son premier sens ; premier sens -> sens inverse ; sens inverse -> ordre par défaut.
export function nextPaymentSort(current: PaymentSort, key: PaymentSortKey): PaymentSort {
  const first = FIRST_DIRECTION[key];
  if (current.key !== key) return { key, direction: first };
  if (current.direction === first) return { key, direction: first === "asc" ? "desc" : "asc" };
  return DEFAULT_PAYMENT_SORT;
}

// Lit les filtres dans l'adresse. Toute valeur inconnue donne la valeur par défaut.
export function parsePaymentFilters(params: SearchParams): PaymentFilters {
  const rawPeriod = firstValue(params.periode);
  const rawMode = firstValue(params.mode);
  const rawStatus = firstValue(params.statut);
  const rawType = firstValue(params.type);
  // Texte vide ou espaces seuls : pas de filtre (null).
  const rawCollector = (firstValue(params.encaisse) ?? "").trim().slice(0, MAX_QUERY_LENGTH);

  return {
    period: PERIODS.find((p) => p === rawPeriod) ?? DEFAULT_PAYMENT_FILTERS.period,
    method: METHODS.find(([slug]) => slug === rawMode)?.[1] ?? null,
    status: STATUSES.find(([slug]) => slug === rawStatus)?.[1] ?? null,
    type: TYPES.find(([slug]) => slug === rawType)?.[1] ?? null,
    collector: rawCollector === "" ? null : rawCollector,
    q: (firstValue(params.q) ?? "").trim().slice(0, MAX_QUERY_LENGTH),
    sort: parsePaymentSort(params),
  };
}

// Paires [nom, valeur] des filtres qui ne sont pas à leur valeur par défaut
// (sans la recherche ni la page). Sert à construire l'adresse, et les champs
// cachés d'un formulaire de recherche qui doit conserver les filtres.
export function activeFilterParams(filters: PaymentFilters): [string, string][] {
  const entries: [string, string][] = [];
  if (filters.period !== DEFAULT_PAYMENT_FILTERS.period) {
    entries.push(["periode", filters.period]);
  }
  const mode = METHODS.find(([, value]) => value === filters.method)?.[0];
  if (mode) entries.push(["mode", mode]);
  const statut = STATUSES.find(([, value]) => value === filters.status)?.[0];
  if (statut) entries.push(["statut", statut]);
  const type = TYPES.find(([, value]) => value === filters.type)?.[0];
  if (type) entries.push(["type", type]);
  if (filters.collector) entries.push(["encaisse", filters.collector]);
  if (!samePaymentSort(filters.sort, DEFAULT_PAYMENT_SORT)) {
    const slug = SORT_KEYS.find(([, key]) => key === filters.sort.key)?.[0];
    if (slug) {
      entries.push(["tri", slug]);
      entries.push(["ordre", filters.sort.direction]);
    }
  }
  return entries;
}

// Construit la partie « ?… » de l'adresse. Les valeurs par défaut sont omises.
export function buildPaymentsQuery(filters: PaymentFilters, page = 1): string {
  const qs = new URLSearchParams(activeFilterParams(filters));
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
      (filters.type === null || p.type === filters.type) &&
      // Égalité exacte : la valeur vient de la liste déroulante (listCollectors).
      (filters.collector === null || p.confirmedBy === filters.collector) &&
      (query === "" || normalizeText(p.memberName).includes(query)),
  );
}

function compareText(a: string, b: string): number {
  return a.localeCompare(b, "fr", { sensitivity: "base" });
}

// Plus récent d'abord ; à égalité, l'identifiant : l'ordre est toujours le même.
function compareNewestFirst(a: Payment, b: Payment): number {
  return (
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime() ||
    compareText(a.id, b.id)
  );
}

// Trie une copie de la liste. À égalité, la date (récent d'abord) puis l'identifiant départagent :
// l'ordre est toujours le même, donc la pagination ne mélange pas les pages.
// Le sens « décroissant » inverse le critère choisi, pas le départage.
export function sortPayments(payments: Payment[], sort: PaymentSort): Payment[] {
  const sign = sort.direction === "desc" ? -1 : 1;
  const primary = (a: Payment, b: Payment): number => {
    switch (sort.key) {
      case "createdAt":
        return sign * (new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case "memberName":
        return sign * compareText(a.memberName, b.memberName);
      case "amountFinal":
        return sign * (a.amountFinal - b.amountFinal);
    }
  };
  return [...payments].sort((a, b) => primary(a, b) || compareNewestFirst(a, b));
}

// Noms d'encaisseurs distincts, triés (pour la liste déroulante).
// Les paiements en ligne n'ont pas d'encaisseur (null) : ils sont ignorés.
export function listCollectors(payments: Payment[]): string[] {
  const names = new Set<string>();
  for (const p of payments) {
    if (p.confirmedBy) names.add(p.confirmedBy);
  }
  return [...names].sort((a, b) => a.localeCompare(b, "fr"));
}

// ── Totaux ──────────────────────────────────────────────────────────────
export interface PaymentTotals {
  collected: number; // total encaissé = espèces + mobile money + carte
  cash: number; // espèces
  mobileMoney: number; // mobile money
  card: number; // carte
  discounts: number; // réductions accordées (PAY-10)
}

// Seuls les paiements confirmés (COMPLETED) comptent comme encaissés.
export function computePaymentTotals(payments: Payment[]): PaymentTotals {
  const totals: PaymentTotals = {
    collected: 0,
    cash: 0,
    mobileMoney: 0,
    card: 0,
    discounts: 0,
  };
  for (const p of payments) {
    if (p.status !== "COMPLETED") continue;
    totals.collected += p.amountFinal;
    if (p.method === "CASH") totals.cash += p.amountFinal;
    else if (p.method === "MOBILE_MONEY") totals.mobileMoney += p.amountFinal;
    else totals.card += p.amountFinal;
    totals.discounts += p.discount;
  }
  return totals;
}