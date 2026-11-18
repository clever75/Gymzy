// Traduction des valeurs techniques de l'API en libellés français affichés,
// avec un « ton » pour la couleur du Badge (rôles de couleur, jamais de couleur en dur).
import type { DisplayStatus } from "./member-status";
import type { PaymentMethod, PaymentStatus, PaymentType } from "./types";
import type { MemberStatusFilter } from "./member-filters";
import type { Period, StatusFilter } from "./payment-filters";
// Mêmes valeurs que les variantes du composant Badge.
// Si Badge change, TypeScript signalera l'écart à l'endroit où on l'utilise.
export type Tone = "success" | "warning" | "danger" | "info" | "neutral";

export interface StatusLabel {
  label: string;
  tone: Tone;
}

// Record<Union, ...> : TypeScript EXIGE une entrée pour chaque valeur de l'union.
// Si l'API ajoute un statut, le build casse au lieu d'afficher un texte vide.
export const memberStatusLabels: Record<DisplayStatus, StatusLabel> = {
  ACTIVE: { label: "Actif", tone: "success" },
  EXPIRING_SOON: { label: "Expire bientôt", tone: "warning" },
  PENDING: { label: "En attente", tone: "info" },
  EXPIRED: { label: "Expiré", tone: "danger" },
  CANCELLED: { label: "Annulé", tone: "neutral" },
};

export const paymentStatusLabels: Record<PaymentStatus, StatusLabel> = {
  COMPLETED: { label: "Payé", tone: "success" },
  PENDING: { label: "En attente", tone: "warning" },
  PROCESSING: { label: "En cours", tone: "info" },
  FAILED: { label: "Échoué", tone: "danger" },
  REFUNDED: { label: "Remboursé", tone: "neutral" },
};

// Libellés simples : pas de couleur, donc de simples chaînes.
export const paymentMethodLabels: Record<PaymentMethod, string> = {
  CASH: "Espèces",
  MOBILE_MONEY: "Mobile money",
  CARD: "Carte",
};

export const paymentTypeLabels: Record<PaymentType, string> = {
  FIRST_SUBSCRIPTION: "Inscription",
  RENEWAL: "Renouvellement",
  PER_SESSION: "Séance",
  EVENT_TICKET: "Billet",
};

// Libellés des périodes du journal des paiements (WEB-05).
export const periodLabels: Record<Period, string> = {
  jour: "Aujourd'hui",
  "7j": "7 derniers jours",
  mois: "Ce mois",
  tout: "Toute la période",
};
// Libellés des puces de statut du journal des paiements (au pluriel, comme la maquette).
export const statusFilterLabels: Record<StatusFilter, string> = {
  COMPLETED: "Payés",
  PENDING: "En attente",
  FAILED: "Échoués",
};
// Libellés des puces de statut de la liste des membres (WEB-02), comme la maquette.
// Pas de « Annulé » : ces membres n'apparaissent que sous « Tous ».
export const memberFilterLabels: Record<MemberStatusFilter, string> = {
  ACTIVE: "Actifs",
  EXPIRING_SOON: "Expirent bientôt",
  EXPIRED: "Expirés",
  PENDING: "En attente",
};