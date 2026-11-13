import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { buildPaymentsQuery, type PaymentFilters } from "@/lib/payment-filters";

// Lien de téléchargement : un <a> ordinaire (pas next/link), car l'adresse
// renvoie un fichier et non une page.
// Sans numéro de page : l'export contient toutes les lignes filtrées.
export function ExportPaymentsButton({ filters }: { filters: PaymentFilters }) {
  return (
    <a
      href={`/paiements/export${buildPaymentsQuery(filters)}`}
      download
      className={buttonVariants({ variant: "outline" })}
    >
      <Download aria-hidden="true" className="size-4" />
      Exporter en CSV
    </a>
  );
}