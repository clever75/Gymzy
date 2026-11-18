// Couche d'accès aux données des membres (ADR 0002).
// Les pages et les routes passent par ici : elles ne lisent jamais lib/mock directement.
// Aujourd'hui les données sont factices ; au branchement de l'API, seul ce fichier change.
import { filterMembers } from "@/lib/member-filters";
import type { MemberFilters } from "@/lib/member-filters";
import { getDisplayStatus } from "@/lib/member-status";
import type { DisplayStatus } from "@/lib/member-status";
import { getNow } from "@/lib/mock/clock";
import { mockMembers } from "@/lib/mock/members";
import { paginate } from "@/lib/paginate";
import type { Page } from "@/lib/paginate";
import type { Member } from "@/lib/types";

/** Un membre avec son statut tel qu'il s'affiche (« Expire bientôt » inclus). */
export type MemberWithStatus = Member & { displayStatus: DisplayStatus };

/** Une page de membres, plus le total sans filtre pour « Membres (N) ». */
export type MembersPage = Page<MemberWithStatus> & { totalAll: number };

function withStatus(member: Member, now: Date): MemberWithStatus {
  return { ...member, displayStatus: getDisplayStatus(member, now) };
}

/** Liste filtrée et paginée. Le filtre et la page sont des paramètres, comme pour l'API. */
export async function listMembers(filters: MemberFilters, page: number): Promise<MembersPage> {
  const now = getNow();
  const filtered = filterMembers(mockMembers, filters, (m) => getDisplayStatus(m, now));
  const result = paginate(filtered, page);
  return {
    ...result,
    items: result.items.map((m) => withStatus(m, now)),
    totalAll: mockMembers.length,
  };
}

/** Tous les membres filtrés, sans pagination : pour l'export CSV. */
export async function listMembersForExport(filters: MemberFilters): Promise<MemberWithStatus[]> {
  const now = getNow();
  return filterMembers(mockMembers, filters, (m) => getDisplayStatus(m, now)).map((m) =>
    withStatus(m, now),
  );
}

/** Un membre par identifiant, ou null s'il n'existe pas. */
export async function getMember(id: string): Promise<MemberWithStatus | null> {
  const member = mockMembers.find((m) => m.id === id);
  return member ? withStatus(member, getNow()) : null;
}