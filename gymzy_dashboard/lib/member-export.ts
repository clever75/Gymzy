// Transformation des membres en lignes de tableau pour l'export CSV (WEB-02).
// Fonction pure, sans import d'exécution : libellés et formats viennent de l'appelant.
import type { Member } from "./types";

// Nom et prénom séparés : un tableur peut trier sur chacun.
export const MEMBER_EXPORT_HEADERS = [
  "Nom",
  "Prénom",
  "Téléphone",
  "Parent / tuteur",
  "Activité",
  "Formule",
  "Statut",
  "Fin",
  "Coach",
];

export interface MemberExportContext {
  statusLabel: (member: Member) => string; // statut affiché, ex. "Expire bientôt"
  date: (iso: string) => string; // ex. "28/10/2026"
}

// L'ordre des valeurs doit suivre exactement MEMBER_EXPORT_HEADERS.
export function membersToCsvRows(
  members: Member[],
  context: MemberExportContext,
): string[][] {
  return members.map((m) => [
    m.lastName,
    m.firstName,
    m.phone,
    m.guardianName ?? "", // cellule vide, pas le texte « null »
    m.activity,
    m.formula,
    context.statusLabel(m),
    m.endDate ? context.date(m.endDate) : "",
    m.coachName ?? "",
  ]);
}