// Filtres de la liste des membres (WEB-02).
// Fonctions pures, sans import d'exécution : elles se testent avec Node.
// Le statut affiché (« Expire bientôt » est calculé) est fourni par l'appelant,
// voir filterMembers : ce fichier ne connaît pas la date du jour.
import type { Member } from "./types";
import type { DisplayStatus } from "./member-status";

// [texte dans l'URL, valeur filtrée]. Des tableaux et non des objets :
// un objet répondrait aussi à "constructor" ou "__proto__".
// L'adresse « /membres?statut=expire-bientot » est celle visée par la carte « À traiter ».
const STATUSES = [
  ["actifs", "ACTIVE"],
  ["expire-bientot", "EXPIRING_SOON"],
  ["expires", "EXPIRED"],
  ["en-attente", "PENDING"],
] as const;
export type MemberStatusFilter = (typeof STATUSES)[number][1];

export interface MemberFilters {
  status: MemberStatusFilter | null;
  q: string;
}

export const DEFAULT_MEMBER_FILTERS: MemberFilters = { status: null, q: "" };

const MAX_QUERY_LENGTH = 60;

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// Lit les filtres dans l'adresse. Toute valeur inconnue donne la valeur par défaut.
export function parseMemberFilters(params: SearchParams): MemberFilters {
  const rawStatus = firstValue(params.statut);
  return {
    status: STATUSES.find(([slug]) => slug === rawStatus)?.[1] ?? null,
    q: (firstValue(params.q) ?? "").trim().slice(0, MAX_QUERY_LENGTH),
  };
}

// Paires [nom, valeur] des filtres actifs, sans la recherche ni la page.
// Sert à construire l'adresse et les champs cachés du formulaire de recherche.
export function activeMemberFilterParams(filters: MemberFilters): [string, string][] {
  const slug = STATUSES.find(([, value]) => value === filters.status)?.[0];
  return slug ? [["statut", slug]] : [];
}

// Construit la partie « ?… » de l'adresse. Les valeurs par défaut sont omises.
export function buildMembersQuery(filters: MemberFilters, page = 1): string {
  const qs = new URLSearchParams(activeMemberFilterParams(filters));
  if (filters.q) qs.set("q", filters.q);
  if (page > 1) qs.set("page", String(page));
  const text = qs.toString();
  return text ? `?${text}` : "";
}

// Recherche sans accent ni majuscule : « agbe » trouve « Agbé ».
function normalizeText(text: string): string {
  return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

function digitsOnly(text: string): string {
  return text.replace(/\D/g, "");
}

// Les puces sont exclusives : chacune correspond au statut affiché dans le tableau.
// Un membre « Expire bientôt » n'apparaît donc que sous cette puce (et sous « Tous »).
function matchesStatus(
  member: Member,
  status: MemberStatusFilter | null,
  getStatus: (member: Member) => DisplayStatus,
): boolean {
  return status === null || getStatus(member) === status;
}

// Nom (dans les deux ordres) ou téléphone. Le téléphone est comparé sans espaces
// ni « + » : « 90 12 34 » trouve « +228 90 12 34 56 ».
function matchesQuery(member: Member, q: string): boolean {
  if (q === "") return true;
  const query = normalizeText(q);
  const first = normalizeText(member.firstName);
  const last = normalizeText(member.lastName);
  if (`${first} ${last}`.includes(query) || `${last} ${first}`.includes(query)) return true;
  const digits = digitsOnly(q);
  return digits !== "" && digitsOnly(member.phone).includes(digits);
}

export function filterMembers(
  members: Member[],
  filters: MemberFilters,
  getStatus: (member: Member) => DisplayStatus,
): Member[] {
  return members.filter(
    (m) => matchesStatus(m, filters.status, getStatus) && matchesQuery(m, filters.q),
  );
}