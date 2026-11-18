// Quelle action proposer dans la colonne « Reçu » du journal des paiements (WEB-05).
// Fonction pure : elle se teste avec Node, sans interface.
import type { PaymentStatus } from "./types";

export type ReceiptAction = "receipt" | "resend" | null;

// D'après la maquette : « PDF » si le paiement est payé, « Relancer » s'il est en attente.
// Le cahier ne dit rien des autres statuts (en cours, échoué, remboursé) : aucune action
// pour l'instant (question ouverte n° 9).
//   - PAY-07 : un reçu est créé pour chaque paiement confirmé ;
//   - PAY-05 : on relance un paiement bloqué.
export function getReceiptAction(status: PaymentStatus): ReceiptAction {
  if (status === "COMPLETED") return "receipt";
  if (status === "PENDING") return "resend";
  return null;
}
