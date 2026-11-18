// Logique de la fiche membre (WEB-03) sans React : onglets et libellés de période.
// Fonctions pures, testées dans member-detail.test.mjs.
import { formatDate, formatDateShort } from "./format.ts";

// Les six onglets de la maquette, dans l'ordre.
export const MEMBER_TABS = [
  "abonnements",
  "paiements",
  "seances",
  "famille",
  "carte",
  "journal",
] as const;

export type MemberTab = (typeof MEMBER_TABS)[number];

export const DEFAULT_MEMBER_TAB: MemberTab = "abonnements";

export const memberTabLabels: Record<MemberTab, string> = {
  abonnements: "Abonnements",
  paiements: "Paiements",
  seances: "Séances",
  famille: "Famille",
  carte: "Carte et passages",
  journal: "Journal",
};

/** L'onglet demandé dans l'adresse (`?onglet=famille`). Une valeur inconnue donne l'onglet par défaut. */
export function parseMemberTab(value: string | string[] | undefined): MemberTab {
  const raw = Array.isArray(value) ? value[0] : value;
  return MEMBER_TABS.find((tab) => tab === raw) ?? DEFAULT_MEMBER_TAB;
}

/** Adresse d'un onglet. L'onglet par défaut n'écrit rien dans l'adresse (règle 6 : l'adresse porte l'état). */
export function buildMemberTabHref(memberId: string, tab: MemberTab): string {
  const base = `/membres/${encodeURIComponent(memberId)}`;
  return tab === DEFAULT_MEMBER_TAB ? base : `${base}?onglet=${tab}`;
}

/** Adresse d'une page de l'onglet « Paiements ». La page 1 reste propre (pas de `&page=1`). */
export function buildMemberPaymentsHref(memberId: string, page: number): string {
  const base = buildMemberTabHref(memberId, "paiements");
  return page > 1 ? `${base}&page=${page}` : base;
}

/**
 * « 28 sept. → 28 oct. » : l'année n'apparaît que si la période change d'année.
 * Ex. « 28 déc. 2026 → 27 janv. 2027 ».
 */
export function formatPeriodRange(startDate: string, endDate: string): string {
  const startYear = startDate.slice(0, 4);
  const endYear = endDate.slice(0, 4);
  if (startYear !== endYear) return `${formatDate(startDate)} → ${formatDate(endDate)}`;
  return `${formatDateShort(startDate)} → ${formatDateShort(endDate)}`;
}
