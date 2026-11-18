import type { MemberDetailExtras } from "../types";

// Données factices de la fiche, TEMPORAIRES comme lib/mock/members.ts.
// Un membre absent d'ici a une fiche vide : pas de prix convenu, pas de carte, pas de périodes.
export const mockMemberDetails: Record<string, MemberDetailExtras> = {
  // Ama Kofi : le cas de la maquette WEB-03 (deux périodes, prix convenu 12 000 F).
  // Une période de 30 jours : 28 sept. + 30 jours = 28 oct.
  "mem-001": {
    agreedPrice: 12000,
    cardNumber: null, // la maquette affiche GZ-000482, mais CARD-01 n'existe pas encore
    periods: [
      {
        id: "per-001-2",
        startDate: "2026-09-28",
        endDate: "2026-10-28",
        formula: "Mensuel",
        paidByName: "Ama Kofi",
        amount: 12000,
        method: "MOBILE_MONEY",
        confirmedBy: null,
        paymentId: "pay-009",
      },
      {
        id: "per-001-1",
        startDate: "2026-08-28",
        endDate: "2026-09-27",
        formula: "Mensuel",
        paidByName: "Ama Kofi",
        amount: 15000,
        method: "CASH",
        confirmedBy: "Akua",
        paymentId: "pay-027",
      },
    ],
  },
};
