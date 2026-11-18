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
  // Activité, formule et coach : le texte tel qu'affiché dans le tableau (USR-03).
  // Les valeurs viennent des listes déroulantes (listMemberFilterOptions).
  // Au branchement de l'API, ce seront des identifiants plutôt que des noms.
  activity: string | null;
  formula: string | null;
  coach: string | null;
}

export const DEFAULT_MEMBER_FILTERS: MemberFilters = {
  status: null,
  q: "",
  activity: null,
  formula: null,
  coach: null,
};

const MAX_QUERY_LENGTH = 60;

type SearchParams = Record<string, string | string[] | undefined>;

function firstValue(value: string | string[] | undefined): string | undefined {
  return Array.isArray(value) ? value[0] : value;
}

// Texte libre d'un filtre : rogné, limité, et « absent » si vide.
function optionalText(value: string | string[] | undefined): string | null {
  const text = (firstValue(value) ?? "").trim().slice(0, MAX_QUERY_LENGTH);
  return text === "" ? null : text;
}

// Lit les filtres dans l'adresse. Toute valeur inconnue donne la valeur par défaut.
export function parseMemberFilters(params: SearchParams): MemberFilters {
  const rawStatus = firstValue(params.statut);
  return {
    status: STATUSES.find(([slug]) => slug === rawStatus)?.[1] ?? null,
    q: (firstValue(params.q) ?? "").trim().slice(0, MAX_QUERY_LENGTH),
    activity: optionalText(params.activite),
    formula: optionalText(params.formule),
    coach: optionalText(params.coach),
  };
}

// Paires [nom, valeur] des filtres actifs, sans la recherche ni la page.
// Sert à construire l'adresse et les champs cachés du formulaire.
export function activeMemberFilterParams(filters: MemberFilters): [string, string][] {
  const params: [string, string][] = [];
  const slug = STATUSES.find(([, value]) => value === filters.status)?.[0];
  if (slug) params.push(["statut", slug]);
  if (filters.activity) params.push(["activite", filters.activity]);
  if (filters.formula) params.push(["formule", filters.formula]);
  if (filters.coach) params.push(["coach", filters.coach]);
  return params;
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

// Nom (dans les deux ordres) ou téléphone (absent pour un enfant). Le téléphone est
// comparé sans espaces ni « + » : « 90 12 34 » trouve « +228 90 12 34 56 ».
function matchesQuery(member: Member, q: string): boolean {
  if (q === "") return true;
  const query = normalizeText(q);
  const first = normalizeText(member.firstName);
  const last = normalizeText(member.lastName);
  if (`${first} ${last}`.includes(query) || `${last} ${first}`.includes(query)) return true;
  const digits = digitsOnly(q);
  return digits !== "" && digitsOnly(member.phone ?? "").includes(digits);
}

export function filterMembers(
  members: Member[],
  filters: MemberFilters,
  getStatus: (member: Member) => DisplayStatus,
): Member[] {
  return members.filter(
    (m) =>
      matchesStatus(m, filters.status, getStatus) &&
      matchesQuery(m, filters.q) &&
      // Égalité exacte : la valeur vient d'une liste déroulante (listMemberFilterOptions).
      (filters.activity === null || m.activity === filters.activity) &&
      (filters.formula === null || m.formula === filters.formula) &&
      (filters.coach === null || m.coachName === filters.coach),
  );
}

export interface MemberFilterOptions {
  activities: string[];
  formulas: string[];
  coaches: string[];
}

function distinctSorted(values: (string | null)[]): string[] {
  const texts = values.filter((v): v is string => v !== null && v !== "");
  return [...new Set(texts)].sort((a, b) => a.localeCompare(b, "fr"));
}

// Valeurs proposées dans les listes déroulantes : sans doublon, triées,
// et calculées sur TOUS les membres (pas seulement ceux de la page).
// Les membres sans coach (null) n'ajoutent rien à la liste des coachs.
export function listMemberFilterOptions(members: Member[]): MemberFilterOptions {
  return {
    activities: distinctSorted(members.map((m) => m.activity)),
    formulas: distinctSorted(members.map((m) => m.formula)),
    coaches: distinctSorted(members.map((m) => m.coachName)),
  };
}