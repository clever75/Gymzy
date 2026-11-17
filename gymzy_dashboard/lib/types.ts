// Types du dashboard, calqués sur le schéma de référence (domaines 01 à 03).
// Dates : texte ISO, comme le JSON de l'API. Montants : entiers en FCFA.

// Subscription.status (domaine 02)
export type SubscriptionStatus = "PENDING" | "ACTIVE" | "EXPIRED" | "CANCELLED";

// Transaction.type, paymentMethod, status (domaine 03)
export type PaymentType = "FIRST_SUBSCRIPTION" | "RENEWAL" | "PER_SESSION" | "EVENT_TICKET";
export type PaymentMethod = "CASH" | "MOBILE_MONEY" | "CARD";
export type PaymentStatus = "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED" | "REFUNDED";

/** Une ligne de la liste des membres (WEB-02) et base de la fiche (WEB-03). */
export interface Member {
  id: string;
  firstName: string;
  lastName: string;
  phone: string | null;        // null pour un enfant : il n'a pas de numéro propre (USR-02)
  guardianName: string | null; // renseigné pour un enfant (User.guardianId)
  coachName: string | null;    // coach référent, null si aucun (colonne « Coach » de WEB-02)
  activity: string;            // ex. "Musculation"
  formula: string;             // ex. "Mensuel"
  status: SubscriptionStatus;
  endDate: string | null;      // fin de la période en cours, null si jamais payé
}

/** Une ligne de la liste des paiements (WEB-05). */
export interface Payment {
  id: string;
  createdAt: string;           // Transaction.createdAt
  memberId: string;            // lien vers la fiche membre
  memberName: string;
  type: PaymentType;
  amountOriginal: number;      // entier, FCFA
  discount: number;            // entier, FCFA
  amountFinal: number;         // entier, FCFA
  method: PaymentMethod;
  status: PaymentStatus;
  confirmedBy: string | null;  // staff qui a encaissé (espèces seulement)
}