// Tests de l'action proposée dans la colonne « Reçu » (WEB-05).
// Lancer : node --test lib/payment-receipt.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { getReceiptAction } from "./payment-receipt.ts";

test("payé : on propose le reçu PDF ; en attente : on propose de relancer", () => {
  assert.equal(getReceiptAction("COMPLETED"), "receipt");
  assert.equal(getReceiptAction("PENDING"), "resend");
});

test("en cours, échoué, remboursé : aucune action (le cahier ne dit rien)", () => {
  for (const status of ["PROCESSING", "FAILED", "REFUNDED"]) {
    assert.equal(getReceiptAction(status), null, status);
  }
});
