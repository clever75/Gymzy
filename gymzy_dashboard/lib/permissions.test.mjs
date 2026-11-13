// Tests des permissions.
// Lancer : node --test lib/permissions.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { canExportPayments } from "./permissions.ts";

test("export des paiements : réservé à l'administrateur (AUTH-11)", () => {  assert.equal(canExportPayments("ORG_ADMIN"), true);
  assert.equal(canExportPayments("STAFF"), false);
  assert.equal(canExportPayments("COACH"), false);
});