import type { Payment, PaymentMethod, PaymentStatus, PaymentType } from "../types";

// Helper : amountFinal est CALCULÉ, jamais recopié à la main.
function pay(
  n: number,
  createdAt: string,
  memberId: string,
  memberName: string,
  type: PaymentType,
  amountOriginal: number,
  discount: number,
  method: PaymentMethod,
  status: PaymentStatus,
  confirmedBy: string | null = null,
): Payment {
  return {
    id: `pay-${String(n).padStart(3, "0")}`,
    createdAt,
    memberId,
    memberName,
    type,
    amountOriginal,
    discount,
    amountFinal: amountOriginal - discount,
    method,
    status,
    confirmedBy,
  };
}

// 28 paiements (> 25) pour voir la page 2 de la pagination. Du plus récent au plus ancien.
export const mockPayments: Payment[] = [
  pay(1, "2026-10-05T10:42:00Z", "mem-001", "Ama Kofi", "RENEWAL", 15000, 3000, "MOBILE_MONEY", "COMPLETED"),
  pay(2, "2026-10-05T09:15:00Z", "mem-004", "Efua Adjo", "RENEWAL", 15000, 0, "CASH", "COMPLETED", "Akua"),
  pay(3, "2026-10-05T08:50:00Z", "mem-002", "Yao Mensah", "RENEWAL", 15000, 0, "MOBILE_MONEY", "PENDING"),
  pay(4, "2026-10-03T17:20:00Z", "mem-008", "Edem Amegah", "FIRST_SUBSCRIPTION", 50000, 0, "CARD", "COMPLETED"),
  pay(5, "2026-10-02T11:05:00Z", "mem-012", "Abla Sossou", "FIRST_SUBSCRIPTION", 20000, 0, "CASH", "COMPLETED", "Akua"),
  pay(6, "2026-10-01T16:40:00Z", "mem-010", "Mawusi Gbedey", "RENEWAL", 15000, 0, "MOBILE_MONEY", "FAILED"),
  pay(7, "2026-09-30T18:10:00Z", "mem-005", "Mawuli Dogbé", "RENEWAL", 20000, 0, "MOBILE_MONEY", "COMPLETED"),
  pay(8, "2026-09-29T09:30:00Z", "mem-007", "Afi Kofi", "RENEWAL", 20000, 0, "MOBILE_MONEY", "COMPLETED"),
  pay(9, "2026-09-28T14:00:00Z", "mem-001", "Ama Kofi", "RENEWAL", 15000, 3000, "MOBILE_MONEY", "COMPLETED"),
  pay(10, "2026-09-27T12:25:00Z", "mem-001", "Ama Kofi", "RENEWAL", 15000, 3000, "MOBILE_MONEY", "FAILED"),
  pay(11, "2026-09-26T10:00:00Z", "mem-006", "Kofi Kofi", "PER_SESSION", 4000, 0, "MOBILE_MONEY", "COMPLETED"),
  pay(12, "2026-09-25T15:45:00Z", "mem-009", "Selom Tetteh", "RENEWAL", 15000, 0, "CASH", "COMPLETED", "Akua"),
  pay(13, "2026-09-24T08:10:00Z", "mem-011", "Komlan Atsou", "PER_SESSION", 4000, 0, "CASH", "COMPLETED", "Akua"),
  pay(14, "2026-09-22T17:30:00Z", "mem-006", "Kofi Kofi", "RENEWAL", 25000, 0, "MOBILE_MONEY", "COMPLETED"),
  pay(15, "2026-09-20T09:00:00Z", "mem-003", "Kodjo Agbé", "FIRST_SUBSCRIPTION", 15000, 3000, "MOBILE_MONEY", "PENDING"),
  pay(16, "2026-09-18T13:15:00Z", "mem-002", "Yao Mensah", "RENEWAL", 15000, 0, "CASH", "COMPLETED", "Akua"),
  pay(17, "2026-09-16T10:50:00Z", "mem-012", "Abla Sossou", "PER_SESSION", 4000, 0, "CASH", "COMPLETED", "Akua"),
  pay(18, "2026-09-14T16:05:00Z", "mem-008", "Edem Amegah", "PER_SESSION", 4000, 0, "CARD", "REFUNDED"),
  pay(19, "2026-09-12T11:30:00Z", "mem-005", "Mawuli Dogbé", "FIRST_SUBSCRIPTION", 20000, 0, "CASH", "COMPLETED", "Akua"),
  pay(20, "2026-09-10T18:00:00Z", "mem-010", "Mawusi Gbedey", "FIRST_SUBSCRIPTION", 15000, 0, "MOBILE_MONEY", "COMPLETED"),
  pay(21, "2026-09-08T09:40:00Z", "mem-007", "Afi Kofi", "FIRST_SUBSCRIPTION", 20000, 0, "MOBILE_MONEY", "COMPLETED"),
  pay(22, "2026-09-05T14:20:00Z", "mem-009", "Selom Tetteh", "FIRST_SUBSCRIPTION", 15000, 0, "CASH", "COMPLETED", "Akua"),
  pay(23, "2026-09-03T10:10:00Z", "mem-004", "Efua Adjo", "RENEWAL", 15000, 0, "MOBILE_MONEY", "COMPLETED"),
  pay(24, "2026-09-01T12:00:00Z", "mem-011", "Komlan Atsou", "FIRST_SUBSCRIPTION", 15000, 0, "CASH", "COMPLETED", "Akua"),
  pay(25, "2026-08-31T15:30:00Z", "mem-006", "Kofi Kofi", "FIRST_SUBSCRIPTION", 25000, 0, "MOBILE_MONEY", "COMPLETED"),
  pay(26, "2026-08-29T11:00:00Z", "mem-002", "Yao Mensah", "RENEWAL", 15000, 0, "MOBILE_MONEY", "COMPLETED"),
  pay(27, "2026-08-28T10:20:00Z", "mem-001", "Ama Kofi", "FIRST_SUBSCRIPTION", 15000, 0, "CASH", "COMPLETED", "Akua"),
  pay(28, "2026-08-28T09:05:00Z", "mem-004", "Efua Adjo", "FIRST_SUBSCRIPTION", 15000, 0, "CASH", "COMPLETED", "Akua"),
];