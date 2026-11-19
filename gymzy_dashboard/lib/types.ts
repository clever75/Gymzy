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
  guardianId: string | null;   // identifiant du parent (User.guardianId) ; sert à retrouver la famille (FAM-01)
  guardianName: string | null; // nom affiché du parent, renseigné pour un enfant ; doit correspondre à guardianId
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

/** Une période payée d'un abonnement (ABO-09) : une ligne de l'onglet « Abonnements » (WEB-03). */
export interface SubscriptionPeriod {
  id: string;
  startDate: string;           // date seule ISO, "2026-09-28"
  endDate: string;             // date seule ISO, "2026-10-28"
  formula: string;             // formule payée, ex. "Mensuel"
  paidByName: string;          // le payeur peut différer du membre (un parent paie pour son enfant, FAM-04)
  amount: number;              // entier, FCFA : ce qui a été payé, réduction déduite
  method: PaymentMethod;
  confirmedBy: string | null;  // staff qui a encaissé (espèces seulement), comme Payment.confirmedBy
  paymentId: string | null;    // Payment.id lié : servira au reçu (PAY-07) et à l'onglet Paiements
}

/** Ce que la fiche (WEB-03) ajoute à la ligne de liste `Member` (WEB-02). */
export interface MemberDetailExtras {
  agreedPrice: number | null;     // prix convenu (ABO-05), FCFA ; null = aucun
  cardNumber: string | null;      // ex. "GZ-000482" ; null tant que CARD-01 n'existe pas
  periods: SubscriptionPeriod[];  // du plus récent au plus ancien
}

/** La fiche complète d'un membre. `Member` reste la ligne de liste, légère. */
export type MemberDetail = Member & MemberDetailExtras;