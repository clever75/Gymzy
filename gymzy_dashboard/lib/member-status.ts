import type { Member, SubscriptionStatus } from "./types";

// Ce qu'on affiche : les 4 statuts de la base + 1 statut calculé.
export type DisplayStatus = SubscriptionStatus | "EXPIRING_SOON";

const MS_PER_DAY = 86_400_000;
export const EXPIRING_SOON_DAYS = 7;

/** Jours entre `now` et `isoDate` (date seule, "2026-10-09"). Négatif = déjà passé. */
export function daysUntil(isoDate: string, now: Date): number {
  const end = Date.parse(`${isoDate}T00:00:00Z`);
  const today = Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate());
  return Math.round((end - today) / MS_PER_DAY);
}

/** Statut à afficher. `now` est un paramètre pour pouvoir tester avec une date fixe. */
export function getDisplayStatus(
  member: Pick<Member, "status" | "endDate">,
  now: Date,
): DisplayStatus {
  if (member.status === "ACTIVE" && member.endDate) {
    const days = daysUntil(member.endDate, now);
    if (days >= 0 && days <= EXPIRING_SOON_DAYS) return "EXPIRING_SOON";
  }
  return member.status;
}