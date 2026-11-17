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
// Décision du 17 nov. 2026 : administrateur et staff. Le test fige ce choix
// pour qu'un changement soit voulu et visible. Les paiements, eux, restent admin seul.
test("export des membres : administrateur et staff, pas les coachs", () => {
  assert.equal(canExportMembers("ORG_ADMIN"), true);
  assert.equal(canExportMembers("STAFF"), true);
  assert.equal(canExportMembers("COACH"), false);
});

test("export : le staff peut exporter les membres mais pas les paiements", () => {
  assert.equal(canExportMembers("STAFF"), true);
  assert.equal(canExportPayments("STAFF"), false);
});
