// Transformation des membres en lignes de tableau pour l'export CSV (WEB-02).
// Fonction pure, sans import d'exécution : libellés et formats viennent de l'appelant.
import type { Member } from "./types";
import type { XlsxCell } from "./xlsx";

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

// Générique : l'appelant peut passer des membres enrichis (ex. avec leur statut affiché)
// et son statusLabel les reçoit tels quels.
export interface MemberExportContext<M extends Member = Member> {
  statusLabel: (member: M) => string; // statut affiché, ex. "Expire bientôt"
  date: (iso: string) => string; // ex. "28/10/2026"
}

// L'ordre des valeurs doit suivre exactement MEMBER_EXPORT_HEADERS.
export function membersToCsvRows<M extends Member>(
  members: M[],
  context: MemberExportContext<M>,
): string[][] {
  return members.map((m) => [
    m.lastName,
    m.firstName,
    m.phone ?? "", // un enfant n'a pas de téléphone : cellule vide
    m.guardianName ?? "", // cellule vide, pas le texte « null »
    m.activity,
    m.formula,
    context.statusLabel(m),
    m.endDate ? context.date(m.endDate) : "",
    m.coachName ?? "",
  ]);
}

// Même contenu pour Excel, mais « Fin » est une vraie date (triable, calculable)
// et non un texte déjà mis en forme. Les autres colonnes sont identiques au CSV.
export function membersToSheetRows<M extends Member>(
  members: M[],
  context: MemberExportContext<M>,
): XlsxCell[][] {
  return members.map((m) => {
    const [lastName, firstName, phone, guardian, activity, formula, status, , coach] =
      membersToCsvRows([m], context)[0];
    // « 2026-10-28 » (jour seul) : minuit UTC, pour que le jour ne bouge jamais selon le fuseau.
    const end = m.endDate
      ? new Date(m.endDate.length === 10 ? `${m.endDate}T00:00:00Z` : m.endDate)
      : null;
    return [lastName, firstName, phone, guardian, activity, formula, status, end, coach];
  });
}
