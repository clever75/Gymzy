// Famille d'un membre (FAM-01, USR-04 « personnes rattachées ») sans React.
// Fonction pure, testée dans member-family.test.mjs.
// Aucun import d'exécution : Node doit pouvoir lancer ce fichier tel quel.

/** Le minimum nécessaire pour retrouver une famille : n'importe quel objet qui a ces deux champs. */
export interface FamilyLink {
  id: string;
  guardianId: string | null;
}

/** Le parent d'un enfant, ou les enfants d'un parent. Un membre sans rattachement a les deux vides. */
export interface Family<T> {
  guardian: T | null;
  children: T[];
}

/**
 * Retrouve la famille d'un membre dans une liste.
 * Un identifiant inconnu, un parent introuvable ou un membre « parent de lui-même » ne plantent pas.
 */
export function getFamily<T extends FamilyLink>(memberId: string, members: readonly T[]): Family<T> {
  const member = members.find((m) => m.id === memberId);
  if (!member) return { guardian: null, children: [] };

  const guardian =
    member.guardianId && member.guardianId !== memberId
      ? (members.find((m) => m.id === member.guardianId) ?? null)
      : null;
  const children = members.filter((m) => m.guardianId === memberId && m.id !== memberId);

  return { guardian, children };
}