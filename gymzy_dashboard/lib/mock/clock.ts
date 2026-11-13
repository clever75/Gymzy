// TEMPORAIRE : date de référence des données factices.
// Les paiements et membres factices datent d'octobre 2026 : avec la vraie date,
// « aujourd'hui » n'afficherait rien. Au branchement, getNow() renverra new Date().
const MOCK_NOW = "2026-10-05T12:00:00Z";

export function getNow(): Date {
  return new Date(MOCK_NOW);
}