// Qui a le droit de faire quoi. Fonctions pures, testables avec Node.
// `import type` est effacé à la compilation : aucun import à l'exécution.
import type { Role } from "./navigation";

// Cahier des charges, AUTH-11 (p. 19) : le staff consulte les paiements mais
// « ne peut pas exporter les recettes ». Matrice des droits (p. 6) : staff = « consultation ».
const PAYMENT_EXPORT_ROLES: Role[] = ["ORG_ADMIN"];

export function canExportPayments(role: Role): boolean {
  return PAYMENT_EXPORT_ROLES.includes(role);
}
// Une liste de membres contient des numéros de téléphone : même règle que
// l'export des paiements, par prudence (« consultation » pour le staff).
// À CONFIRMER avec le cahier des charges : si le staff y a droit, ajouter "STAFF" ici.
const MEMBER_EXPORT_ROLES: Role[] = ["ORG_ADMIN"];

export function canExportMembers(role: Role): boolean {
  return MEMBER_EXPORT_ROLES.includes(role);
}