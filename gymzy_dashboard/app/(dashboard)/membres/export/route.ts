// Export CSV de la liste des membres (WEB-02).
// Le groupe (dashboard) n'apparaît pas dans l'adresse : /membres/export.
import type { NextRequest } from "next/server";
import { buildCsv } from "@/lib/csv";
import { listMembersForExport } from "@/lib/data/members";
import { formatDateNumeric } from "@/lib/format";
import { memberStatusLabels } from "@/lib/labels";
import { MEMBER_EXPORT_HEADERS, membersToCsvRows, membersToSheetRows } from "@/lib/member-export";
import { parseMemberFilters } from "@/lib/member-filters";
import { canExportMembers } from "@/lib/permissions";
import { getSession } from "@/lib/session";
import { buildXlsx } from "@/lib/xlsx";

export async function GET(request: NextRequest) {
  // 1. Le rôle est vérifié ICI, côté serveur : cacher le bouton ne suffit pas.
  const { role } = await getSession();
  if (!canExportMembers(role)) {
    return new Response("Accès refusé : export réservé à l'administrateur et au staff.", {
      status: 403,
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }

  // 2. Mêmes filtres que la page, lus par la même fonction. Pas de pagination.
  const filters = parseMemberFilters(Object.fromEntries(request.nextUrl.searchParams));
  const members = await listMembersForExport(filters);

  // 3. Les vrais libellés et formats, injectés dans les fonctions pures.
  const context = {
    statusLabel: (m: (typeof members)[number]) => memberStatusLabels[m.displayStatus].label,
    date: formatDateNumeric,
  };

  // 4. Le format vient de « ?format= » ; tout ce qui n'est pas « xlsx » donne le CSV.
  //    « format » n'est pas un filtre : parseMemberFilters l'ignore.
  const isExcel = request.nextUrl.searchParams.get("format") === "xlsx";

  // 5. Nom de fichier fabriqué par nous (date du jour seulement).
  const day = new Date().toISOString().slice(0, 10);
  const filename = isExcel ? `membres-${day}.xlsx` : `membres-${day}.csv`;

  const body = isExcel
    ? await buildXlsx("Membres", MEMBER_EXPORT_HEADERS, membersToSheetRows(members, context))
    : buildCsv(MEMBER_EXPORT_HEADERS, membersToCsvRows(members, context));
  const contentType = isExcel
    ? "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    : "text/csv; charset=utf-8";

  return new Response(body, {
    headers: {
      "Content-Type": contentType,
      "Content-Disposition": `attachment; filename="${filename}"`,
      // Données personnelles (téléphones) : ni cache navigateur, ni cache intermédiaire.
      "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff",
    },
  });
}