// Qui a le droit de faire quoi. Fonctions pures, testables avec Node.
// `import type` est effacé à la compilation : aucun import à l'exécution.
import type { Role } from "./navigation";

// Cahier des charges, AUTH-11 (p. 19) : le staff consulte les paiements mais
// « ne peut pas exporter les recettes ». Matrice des droits (p. 6) : staff = « consultation ».
const PAYMENT_EXPORT_ROLES: Role[] = ["ORG_ADMIN"];

export function canExportPayments(role: Role): boolean {
  return PAYMENT_EXPORT_ROLES.includes(role);
}