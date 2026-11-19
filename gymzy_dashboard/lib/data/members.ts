// Couche d'accès aux données des membres (ADR 0002).
// Les pages et les routes passent par ici : elles ne lisent jamais lib/mock directement.
// Aujourd'hui les données sont factices ; au branchement de l'API, seul ce fichier change.
import { filterMembers, listMemberFilterOptions, sortMembers } from "@/lib/member-filters";
import type { MemberFilterOptions, MemberFilters } from "@/lib/member-filters";
import { getFamily } from "@/lib/member-family";
import type { Family } from "@/lib/member-family";
import { getDisplayStatus } from "@/lib/member-status";
import type { DisplayStatus } from "@/lib/member-status";
import { getNow } from "@/lib/mock/clock";
import { mockMemberDetails } from "@/lib/mock/member-details";
import { mockMembers } from "@/lib/mock/members";
import { paginate } from "@/lib/paginate";
import type { Page } from "@/lib/paginate";
import type { Member, MemberDetailExtras } from "@/lib/types";

/** Un membre avec son statut tel qu'il s'affiche (« Expire bientôt » inclus). */
export type MemberWithStatus = Member & { displayStatus: DisplayStatus };

/** Une page de membres, plus le total sans filtre pour « Membres (N) ». */
export type MembersPage = Page<MemberWithStatus> & { totalAll: number };

/** Une fiche complète avec son statut tel qu'il s'affiche. */
export type MemberDetailWithStatus = MemberWithStatus & MemberDetailExtras;

/** La famille d'un membre (FAM-01) : son parent s'il est enfant, ses enfants s'il est parent. */
export type MemberFamily = Family<MemberWithStatus>;

/** Membre sans entrée dans le mock : aucun prix convenu, pas de carte, pas d'historique. */
const NO_EXTRAS: MemberDetailExtras = { agreedPrice: null, cardNumber: null, periods: [] };

function withStatus(member: Member, now: Date): MemberWithStatus {
  return { ...member, displayStatus: getDisplayStatus(member, now) };
}

/** Liste filtrée et paginée. Le filtre et la page sont des paramètres, comme pour l'API. */
export async function listMembers(filters: MemberFilters, page: number): Promise<MembersPage> {
  const now = getNow();
  const getStatus = (m: Member) => getDisplayStatus(m, now);
  // Ordre : filtrer, puis trier, puis découper en pages (jamais trier la seule page affichée).
  const sorted = sortMembers(filterMembers(mockMembers, filters, getStatus), filters.sort, getStatus);
  const result = paginate(sorted, page);
  return {
    ...result,
    items: result.items.map((m) => withStatus(m, now)),
    totalAll: mockMembers.length,
  };
}

/** Tous les membres filtrés, sans pagination : pour l'export CSV. */
export async function listMembersForExport(filters: MemberFilters): Promise<MemberWithStatus[]> {
  const now = getNow();
  const getStatus = (m: Member) => getDisplayStatus(m, now);
  // Même ordre que la liste affichée.
  return sortMembers(filterMembers(mockMembers, filters, getStatus), filters.sort, getStatus).map(
    (m) => withStatus(m, now),
  );
}

/** Valeurs des listes déroulantes (activités, formules, coachs) de toute la salle. */
export async function getMemberFilterOptions(): Promise<MemberFilterOptions> {
  return listMemberFilterOptions(mockMembers);
}

/** Un membre par identifiant, ou null s'il n'existe pas. */
export async function getMember(id: string): Promise<MemberWithStatus | null> {
  const member = mockMembers.find((m) => m.id === id);
  return member ? withStatus(member, getNow()) : null;
}

/** La fiche complète d'un membre, ou null s'il n'existe pas. L'API aura une route distincte de la liste. */
export async function getMemberDetail(id: string): Promise<MemberDetailWithStatus | null> {
  const member = mockMembers.find((m) => m.id === id);
  if (!member) return null;
  return { ...withStatus(member, getNow()), ...(mockMemberDetails[id] ?? NO_EXTRAS) };
}

/** La famille d'un membre, avec le statut affiché de chaque personne. Jamais null : « pas de famille » est un cas normal. */
export async function getMemberFamily(id: string): Promise<MemberFamily> {
  const now = getNow();
  const family = getFamily(id, mockMembers);
  return {
    guardian: family.guardian ? withStatus(family.guardian, now) : null,
    children: family.children.map((m) => withStatus(m, now)),
  };
}