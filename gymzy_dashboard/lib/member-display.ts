// Affichage du nom d'un membre. Fonctions pures, sans import d'exécution.
import type { Member } from "./types";

// "Ama", "Kofi" -> "Ama KOFI" : nom de famille en majuscules, comme la maquette.
export function formatMemberName(member: Pick<Member, "firstName" | "lastName">): string {
  return `${member.firstName} ${member.lastName.toLocaleUpperCase("fr-FR")}`;
}

// Un enfant est rattaché à un parent (User.guardianId).
export function isChild(member: Pick<Member, "guardianName">): boolean {
  return member.guardianName !== null;
}