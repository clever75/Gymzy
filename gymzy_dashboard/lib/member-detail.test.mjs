// Tests de la logique de la fiche membre.
// Lancer : node --test lib/member-detail.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { formatDate, formatDateShort } from "./format.ts";
import {
  MEMBER_TABS,
  buildMemberPaymentsHref,
  buildMemberTabHref,
  formatPeriodRange,
  memberTabLabels,
  parseMemberTab,
} from "./member-detail.ts";

// Les formats viennent de l'appelant : ici, les vrais, comme dans la page.
const formats = { date: formatDate, dateShort: formatDateShort };

test("onglet : valeur connue", () => {
  assert.equal(parseMemberTab("famille"), "famille");
  assert.equal(parseMemberTab("journal"), "journal");
});

test("onglet : absent, inconnu ou tableau -> abonnements, ou le premier du tableau", () => {
  assert.equal(parseMemberTab(undefined), "abonnements");
  assert.equal(parseMemberTab(""), "abonnements");
  assert.equal(parseMemberTab("n'importe-quoi"), "abonnements");
  assert.equal(parseMemberTab(["paiements", "famille"]), "paiements");
});

test("chaque onglet a un libellé", () => {
  for (const tab of MEMBER_TABS) assert.ok(memberTabLabels[tab].length > 0);
});

test("adresse d'un onglet : l'onglet par défaut reste propre", () => {
  assert.equal(buildMemberTabHref("mem-001", "abonnements"), "/membres/mem-001");
  assert.equal(buildMemberTabHref("mem-001", "paiements"), "/membres/mem-001?onglet=paiements");
});

test("adresse d'un onglet : l'identifiant est encodé", () => {
  assert.equal(buildMemberTabHref("a b/c", "famille"), "/membres/a%20b%2Fc?onglet=famille");
});

test("adresse d'une page de paiements : la page 1 reste propre", () => {
  assert.equal(buildMemberPaymentsHref("mem-001", 1), "/membres/mem-001?onglet=paiements");
  assert.equal(buildMemberPaymentsHref("mem-001", 0), "/membres/mem-001?onglet=paiements");
});

test("adresse d'une page de paiements : les pages suivantes ajoutent ?page", () => {
  assert.equal(buildMemberPaymentsHref("mem-001", 2), "/membres/mem-001?onglet=paiements&page=2");
  assert.equal(buildMemberPaymentsHref("a b", 3), "/membres/a%20b?onglet=paiements&page=3");
});

test("période dans la même année : sans année", () => {
  assert.equal(formatPeriodRange("2026-09-28", "2026-10-28", formats), "28 sept. → 28 oct.");
});

test("période à cheval sur deux années : avec les années", () => {
  assert.equal(
    formatPeriodRange("2026-12-28", "2027-01-27", formats),
    "28 déc. 2026 → 27 janv. 2027",
  );
});
