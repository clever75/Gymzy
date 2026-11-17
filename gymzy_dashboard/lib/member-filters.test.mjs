// Tests des filtres de la liste des membres (WEB-02).
// Lancer : node --test lib/member-filters.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  parseMemberFilters,
  activeMemberFilterParams,
  buildMembersQuery,
  filterMembers,
  DEFAULT_MEMBER_FILTERS,
} from "./member-filters.ts";

const m = (id, firstName, lastName, phone, status) => ({
  id, firstName, lastName, phone, status,
  guardianName: null, activity: "Musculation", formula: "Mensuel",
  coachName: null, endDate: null,
});
const members = [
  m("1", "Ama", "Kofi", "+228 90 12 34 56", "ACTIVE"),
  m("2", "Kodjo", "Agbé", "+228 91 00 00 01", "ACTIVE"),
  m("3", "Efua", "Adjo", "+228 92 00 00 02", "EXPIRED"),
  m("4", "Selom", "Tetteh", "+228 93 00 00 03", "PENDING"),
];
// Faux statut affiché : le membre « 2 » expire bientôt.
const getStatus = (x) => (x.id === "2" ? "EXPIRING_SOON" : x.status);
const ids = (list) => list.map((x) => x.id);

test("parse : valeurs absentes ou inconnues = valeurs par défaut", () => {
  assert.deepEqual(parseMemberFilters({}), DEFAULT_MEMBER_FILTERS);
  assert.deepEqual(parseMemberFilters({ statut: "nimporte" }), DEFAULT_MEMBER_FILTERS);
});

test("parse : refuse les noms spéciaux d'objets", () => {
  assert.equal(parseMemberFilters({ statut: "constructor" }).status, null);
  assert.equal(parseMemberFilters({ statut: "__proto__" }).status, null);
});

test("parse : statut valide, tableau (premier élément), recherche rognée et limitée", () => {
  assert.equal(parseMemberFilters({ statut: "expires" }).status, "EXPIRED");
  assert.equal(parseMemberFilters({ statut: ["en-attente", "expires"] }).status, "PENDING");
  assert.equal(parseMemberFilters({ q: "  ama  " }).q, "ama");
  assert.equal(parseMemberFilters({ q: "x".repeat(200) }).q.length, 60);
});

test("adresse : valeurs par défaut omises, page 1 omise", () => {
  assert.equal(buildMembersQuery(DEFAULT_MEMBER_FILTERS), "");
  assert.equal(buildMembersQuery({ status: "EXPIRING_SOON", q: "" }), "?statut=expire-bientot");
  assert.equal(
    buildMembersQuery({ status: "ACTIVE", q: "ama kofi" }, 3),
    "?statut=actifs&q=ama+kofi&page=3",
  );
  assert.deepEqual(activeMemberFilterParams(DEFAULT_MEMBER_FILTERS), []);
});

test("filtre sans critère : tout le monde", () => {
  assert.deepEqual(ids(filterMembers(members, DEFAULT_MEMBER_FILTERS, getStatus)), ["1", "2", "3", "4"]);
});

test("« Actifs » inclut ceux qui expirent bientôt ; « Expirent bientôt » seulement eux", () => {
  const actifs = filterMembers(members, { status: "ACTIVE", q: "" }, getStatus);
  assert.deepEqual(ids(actifs), ["1", "2"]);
  const bientot = filterMembers(members, { status: "EXPIRING_SOON", q: "" }, getStatus);
  assert.deepEqual(ids(bientot), ["2"]);
});

test("statuts expirés et en attente", () => {
  assert.deepEqual(ids(filterMembers(members, { status: "EXPIRED", q: "" }, getStatus)), ["3"]);
  assert.deepEqual(ids(filterMembers(members, { status: "PENDING", q: "" }, getStatus)), ["4"]);
});

test("recherche : sans accent ni majuscule, nom dans les deux ordres", () => {
  const find = (q) => ids(filterMembers(members, { status: null, q }, getStatus));
  assert.deepEqual(find("AGBE"), ["2"]);
  assert.deepEqual(find("kofi ama"), ["1"]);
  assert.deepEqual(find("ama kofi"), ["1"]);
  assert.deepEqual(find("introuvable"), []);
});

test("recherche : téléphone sans espaces ni « + »", () => {
  const find = (q) => ids(filterMembers(members, { status: null, q }, getStatus));
  assert.deepEqual(find("90 12 34"), ["1"]);
  assert.deepEqual(find("+228 92"), ["3"]);
  // Une recherche sans chiffre ne doit pas tout renvoyer via le téléphone.
  assert.deepEqual(find("+"), []);
});

test("statut et recherche se combinent", () => {
  assert.deepEqual(ids(filterMembers(members, { status: "EXPIRED", q: "ama" }, getStatus)), []);
  assert.deepEqual(ids(filterMembers(members, { status: "ACTIVE", q: "ama" }, getStatus)), ["1"]);
});
