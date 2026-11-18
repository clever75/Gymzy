import { Download } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { buildMembersQuery, type MemberFilters } from "@/lib/member-filters";

// Liens de téléchargement : des <a> ordinaires (pas next/link), car l'adresse
// renvoie un fichier et non une page.
// Sans numéro de page : l'export contient toutes les lignes filtrées, dans l'ordre du tri.
// « format=xlsx » choisit Excel ; sans lui, c'est le CSV (DASH-03 : CSV et Excel).
export function ExportMembersButton({ filters }: { filters: MemberFilters }) {
  const query = buildMembersQuery(filters);
  const excelQuery = query ? `${query}&format=xlsx` : "?format=xlsx";
  return (
    <>
      <a
        href={`/membres/export${query}`}
        download
        className={buttonVariants({ variant: "outline" })}
      >
        <Download aria-hidden="true" className="size-4" />
        Exporter en CSV
      </a>
      <a
        href={`/membres/export${excelQuery}`}
        download
        className={buttonVariants({ variant: "outline" })}
      >
        <Download aria-hidden="true" className="size-4" />
        Exporter en Excel
      </a>
    </>
  );
}
