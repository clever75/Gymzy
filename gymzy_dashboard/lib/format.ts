// Fonctions d'affichage partagées par tout le dashboard.
// Règles du cahier : montants en francs CFA sans décimales, avec séparateur
// de milliers ; dates en français au format « 28 oct. 2026 ».

// Fuseau fixé explicitement. Sans lui, le serveur et le navigateur pourraient
// afficher des jours différents, et React signalerait une erreur d'hydratation.
// Lomé est en UTC+0. À rendre configurable par salle plus tard.
const DEFAULT_TIME_ZONE = "Africa/Lome";

// Les objets Intl sont coûteux à créer : on les crée une seule fois ici,
// pas à chaque appel de fonction.
const fcfaNumber = new Intl.NumberFormat("fr-FR", {
  maximumFractionDigits: 0,
});

const shortDate = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: DEFAULT_TIME_ZONE,
});
const timeOnly = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
  timeZone: DEFAULT_TIME_ZONE,
});

// 12000 -> "12 000 F"
export function formatFcfa(amount: number): string {
  // Une valeur absente ou invalide ne doit pas afficher « NaN F ».
  if (!Number.isFinite(amount)) return "—";
  // \u00A0 = espace insécable : le « F » reste collé au nombre, même en fin de ligne.
  return `${fcfaNumber.format(amount)}\u00A0F`;
}

// "2026-10-28" ou Date -> "28 oct. 2026"
export function formatDate(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return shortDate.format(date);
}

// "2026-10-05T10:42:00Z" -> "10:42"
export function formatTime(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return timeOnly.format(date);
}

const numericDate = new Intl.DateTimeFormat("fr-FR", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: DEFAULT_TIME_ZONE,
});

// "2026-10-28T10:42:00Z" -> "28/10/2026"
// Pour les exports : un tableur en français le reconnaît comme une date.
export function formatDateNumeric(value: Date | string): string {
  const date = value instanceof Date ? value : new Date(value);
  if (Number.isNaN(date.getTime())) return "—";
  return numericDate.format(date);
}