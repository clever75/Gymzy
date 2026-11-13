// Tests de la transformation des paiements en lignes CSV.
// Lancer : node --test lib/payment-export.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCsv } from "./csv.ts";
import { PAYMENT_EXPORT_HEADERS, paymentsToCsvRows } from "./payment-export.ts";

// Faux libellés : on teste la structure, pas la traduction.
const context = {
  typeLabel: (t) => `type:${t}`,
  methodLabel: (m) => `mode:${m}`,
  statusLabel: (s) => `statut:${s}`,
  date: (iso) => iso.slice(0, 10),
  time: (iso) => iso.slice(11, 16),
};

const payment = {
  id: "p1",
  createdAt: "2026-10-28T10:42:00Z",
  memberId: "m1",
  memberName: "Ama Kofi",
  type: "RENEWAL",
  amountOriginal: 15000,
  discount: 3000,
  amountFinal: 12000,
  method: "MOBILE_MONEY",
  status: "COMPLETED",
  confirmedBy: null,
};

test("une ligne : ordre des colonnes, montants en nombres, encaisseur absent = vide", () => {
  assert.deepEqual(paymentsToCsvRows([payment], context), [
    ["2026-10-28", "10:42", "Ama Kofi", "type:RENEWAL", "mode:MOBILE_MONEY",
     15000, 3000, 12000, "statut:COMPLETED", ""],
  ]);
});

test("chaque ligne a autant de cellules que d'en-têtes", () => {
  const rows = paymentsToCsvRows([payment, { ...payment, id: "p2", confirmedBy: "Akua" }], context);
  for (const row of rows) assert.equal(row.length, PAYMENT_EXPORT_HEADERS.length);
});

test("aucun paiement : aucune ligne (le fichier garde ses en-têtes)", () => {
  assert.deepEqual(paymentsToCsvRows([], context), []);
  const csv = buildCsv(PAYMENT_EXPORT_HEADERS, []);
  assert.ok(csv.startsWith("\uFEFFDate;Heure;Membre;"));
});

test("un nom de membre piégé est neutralisé dans le fichier final", () => {
  const csv = buildCsv(
    PAYMENT_EXPORT_HEADERS,
    paymentsToCsvRows([{ ...payment, memberName: "=1+1" }], context),
  );
  assert.ok(csv.includes(";'=1+1;"));
});