// Tests des permissions.
// Lancer : node --test lib/permissions.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { canExportPayments, canExportMembers } from "./permissions.ts";

test("export des paiements : réservé à l'administrateur (AUTH-11)", () => {
  assert.equal(canExportPayments("ORG_ADMIN"), true);
  assert.equal(canExportPayments("STAFF"), false);
  assert.equal(canExportPayments("COACH"), false);
});
// Choix provisoire (question ouverte : staff autorisé ou non ?). Ce test le fige
// pour qu'un changement soit voulu et visible.
test("export des membres : réservé à l'administrateur (à confirmer)", () => {
  assert.equal(canExportMembers("ORG_ADMIN"), true);
  assert.equal(canExportMembers("STAFF"), false);
  assert.equal(canExportMembers("COACH"), false);
});
