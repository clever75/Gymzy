import { Button } from "@/components/ui/button";
import { getReceiptAction } from "@/lib/payment-receipt";
import type { PaymentStatus } from "@/lib/types";

// Colonne « Reçu » : « PDF » (payé) ou « Relancer » (en attente), comme la maquette.
// Ces actions dépendent de l'API (PAY-07 : reçu PDF, PAY-05 : nouveau lien de paiement).
// Tant qu'elle n'est pas branchée, les boutons sont affichés mais désactivés :
// la maquette est respectée sans faire croire que ça marche.
const NOT_AVAILABLE = "Disponible avec le branchement à l'API";

export function ReceiptCell({ status }: { status: PaymentStatus }) {
  const action = getReceiptAction(status);
  if (action === null) return <span aria-label="Aucune action">—</span>;
  return (
    <Button variant="outline" size="sm" disabled title={NOT_AVAILABLE} className="px-2">
      {action === "receipt" ? "PDF" : "Relancer"}
    </Button>
  );
}
