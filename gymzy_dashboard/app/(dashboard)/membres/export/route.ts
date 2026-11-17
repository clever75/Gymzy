// Export CSV de la liste des membres (WEB-02).
// Le groupe (dashboard) n'apparaît pas dans l'adresse : /membres/export.
import type { NextRequest } from "next/server";
import { buildCsv } from "@/lib/csv";
import { listMembersForExport } from "@/lib/data/members";
import { formatDateNumeric } from "@/lib/format";
import { memberStatusLabels } from "@/lib/labels";
import { MEMBER_EXPORT_HEADERS, membersToCsvRows } from "@/lib/member-export";
import { parseMemberFilters } from "@/lib/member-filters";
import { canExportMembers } from "@/lib/permissions";
import { getSession } from "@/lib/session";

export async function GET(request: NextRequest) {
  // 1. Le rôle est vérifié ICI, côté serveur : cacher le bouton ne suffit pas.
  const { role } = await getSession();
  if (!canExportMembers(role)) {
    return new Response("Accès refusé : export réservé à l'administrateur.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // 2. Mêmes filtres que la page, lus par la même fonction. Pas de pagination.
  const filters = parseMemberFilters(Object.fromEntries(request.nextUrl.searchParams));
  const members = await listMembersForExport(filters);

  // 3. Les vrais libellés et formats, injectés dans la fonction pure.
  const rows = membersToCsvRows(members, {
    statusLabel: (m) => memberStatusLabels[m.displayStatus].label,
    date: formatDateNumeric,
  });
  const csv = buildCsv(MEMBER_EXPORT_HEADERS, rows);

  // 4. Nom de fichier fabriqué par nous (date du jour seulement).
  const filename = `membres-${new Date().toISOString().slice(0, 10)}.csv`;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}"`,
      // Données personnelles (téléphones) : ni cache navigateur, ni cache intermédiaire.
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}