import type { Member } from "../types";

// Données factices inspirées des maquettes. « Aujourd'hui » = lundi 5 oct. 2026.
// À supprimer quand l'API sera branchée (les types, eux, restent).
export const mockMembers: Member[] = [
  { id: "mem-001", firstName: "Ama", lastName: "Kofi", phone: "+228 90 12 34 56", guardianId: null, guardianName: null, activity: "Musculation", formula: "Mensuel", status: "ACTIVE", coachName: "Kossi A.", endDate: "2026-10-28" },
  { id: "mem-002", firstName: "Yao", lastName: "Mensah", phone: "+228 90 12 34 57", guardianId: null, guardianName: null, activity: "Musculation", formula: "Mensuel", status: "ACTIVE", coachName: "Kossi A.", endDate: "2026-10-09" },
  { id: "mem-003", firstName: "Kodjo", lastName: "Agbé", phone: "+228 90 12 34 58", guardianId: null, guardianName: null, activity: "Musculation", formula: "Mensuel", status: "PENDING", coachName: null, endDate: null },
  { id: "mem-004", firstName: "Efua", lastName: "Adjo", phone: "+228 90 12 34 59", guardianId: null, guardianName: null, activity: "Musculation", formula: "Mensuel", status: "EXPIRED", coachName: null, endDate: "2026-09-20" },
  { id: "mem-005", firstName: "Mawuli", lastName: "Dogbé", phone: "+228 90 12 34 60", guardianId: null, guardianName: null, activity: "Musculation", formula: "Mensuel illimité", status: "ACTIVE", coachName: "Kossi A.", endDate: "2026-11-14" },
  { id: "mem-006", firstName: "Kofi", lastName: "Kofi", phone: null, guardianId: "mem-001", guardianName: "Ama Kofi", activity: "Danse", formula: "Mensuel", status: "ACTIVE", coachName: "Mme Dede", endDate: "2026-10-15" },
  { id: "mem-007", firstName: "Afi", lastName: "Kofi", phone: null, guardianId: "mem-001", guardianName: "Ama Kofi", activity: "Gym enfant", formula: "Mensuel", status: "ACTIVE", coachName: "Mme Dede", endDate: "2026-11-02" },
  { id: "mem-008", firstName: "Edem", lastName: "Amegah", phone: "+228 90 12 34 61", guardianId: null, guardianName: null, activity: "Musculation", formula: "Trimestriel", status: "ACTIVE", coachName: "Kossi A.", endDate: "2026-12-20" },
  { id: "mem-009", firstName: "Selom", lastName: "Tetteh", phone: "+228 90 12 34 62", guardianId: null, guardianName: null, activity: "Musculation", formula: "Mensuel", status: "EXPIRED", coachName: null, endDate: "2026-08-30" },
  { id: "mem-010", firstName: "Mawusi", lastName: "Gbedey", phone: "+228 90 12 34 63", guardianId: null, guardianName: null, activity: "Musculation", formula: "Mensuel", status: "ACTIVE", coachName: "Mme Dede", endDate: "2026-10-07" },
  { id: "mem-011", firstName: "Komlan", lastName: "Atsou", phone: "+228 90 12 34 64", guardianId: null, guardianName: null, activity: "Musculation", formula: "Mensuel", status: "CANCELLED", coachName: null, endDate: "2026-09-12" },
  { id: "mem-012", firstName: "Abla", lastName: "Sossou", phone: "+228 90 12 34 65", guardianId: null, guardianName: null, activity: "Musculation", formula: "Mensuel illimité", status: "ACTIVE", coachName: "Kossi A.", endDate: "2026-11-30" },
];