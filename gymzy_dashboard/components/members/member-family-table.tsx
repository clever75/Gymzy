import Link from "next/link";
import { Badge } from "@/components/ui/badge";
import {
  Table,
  TableBody,
  TableCell,
  TableEmpty,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MemberFamily } from "@/lib/data/members";
import { formatDate } from "@/lib/format";
import { memberStatusLabels } from "@/lib/labels";
import { buildMemberTabHref } from "@/lib/member-detail";
import { formatMemberName } from "@/lib/member-display";

// Onglet « Famille » de la fiche (WEB-03, FAM-01) : le parent d'un enfant, ou les enfants d'un parent.
// Les écritures (ajouter un enfant, le retirer, souscrire pour lui : FAM-02 à FAM-04) ont besoin de l'API.
export function MemberFamilyTable({ family }: { family: MemberFamily }) {
  // Le parent d'abord, puis les enfants : la relation se déduit du côté d'où on regarde.
  const rows = [
    ...(family.guardian ? [{ person: family.guardian, relation: "Parent" }] : []),
    ...family.children.map((person) => ({ person, relation: "Enfant" })),
  ];

  return (
    <Table aria-label="Famille du membre">
      <TableHeader>
        <TableRow>
          <TableHead>Membre</TableHead>
          <TableHead>Lien</TableHead>
          <TableHead>Activité · Formule</TableHead>
          <TableHead>Statut</TableHead>
          <TableHead>Fin de période</TableHead>
          <TableHead>Téléphone</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableEmpty colSpan={6}>Aucune personne rattachée à ce membre.</TableEmpty>
        ) : (
          rows.map(({ person, relation }) => {
            const status = memberStatusLabels[person.displayStatus];
            return (
              <TableRow key={person.id}>
                <TableCell className="whitespace-nowrap">
                  <Link
                    href={buildMemberTabHref(person.id, "abonnements")}
                    className="font-bold text-primary underline"
                  >
                    {formatMemberName(person)}
                  </Link>
                </TableCell>
                <TableCell className="whitespace-nowrap">{relation}</TableCell>
                <TableCell className="whitespace-nowrap">
                  {person.activity} · {person.formula}
                </TableCell>
                <TableCell>
                  <Badge variant={status.tone}>{status.label}</Badge>
                </TableCell>
                <TableCell className="whitespace-nowrap">
                  {person.endDate ? formatDate(person.endDate) : "—"}
                </TableCell>
                <TableCell className="whitespace-nowrap">{person.phone ?? "—"}</TableCell>
              </TableRow>
            );
          })
        )}
      </TableBody>
    </Table>
  );
}