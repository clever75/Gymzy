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
  listMemberFilterOptions,
} from "./member-filters.ts";

// Filtres complets : on ne précise que ce qui change par rapport aux valeurs par défaut.
const f = (changes) => ({ ...DEFAULT_MEMBER_FILTERS, ...changes });

const m = (id, firstName, lastName, phone, status) => ({
  id, firstName, lastName, phone, status,
  guardianName: null, activity: "Musculation", formula: "Mensuel",
  coachName: null, endDate: null,
});
// Membre complet avec activité, formule et coach.
const full = (id, activity, formula, coachName) => ({
  ...m(id, "Test", "Membre" + id, "+228 90 00 00 0" + id, "ACTIVE"),
  activity, formula, coachName,
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
  assert.equal(buildMembersQuery(f({ status: "EXPIRING_SOON", q: "" })), "?statut=expire-bientot");
  assert.equal(
    buildMembersQuery(f({ status: "ACTIVE", q: "ama kofi" }), 3),
    "?statut=actifs&q=ama+kofi&page=3",
  );
  assert.deepEqual(activeMemberFilterParams(DEFAULT_MEMBER_FILTERS), []);
});

test("filtre sans critère : tout le monde", () => {
  assert.deepEqual(ids(filterMembers(members, DEFAULT_MEMBER_FILTERS, getStatus)), ["1", "2", "3", "4"]);
});

test("puces exclusives : « Actifs » exclut ceux qui expirent bientôt (comme leur badge)", () => {
  const actifs = filterMembers(members, f({ status: "ACTIVE", q: "" }), getStatus);
  assert.deepEqual(ids(actifs), ["1"]);
  const bientot = filterMembers(members, f({ status: "EXPIRING_SOON", q: "" }), getStatus);
  assert.deepEqual(ids(bientot), ["2"]);
});

test("chaque membre est dans une seule puce de statut, et « Tous » les contient tous", () => {
  const puces = ["ACTIVE", "EXPIRING_SOON", "EXPIRED", "PENDING"];
  for (const x of members) {
    const dans = puces.filter((status) =>
      filterMembers([x], f({ status, q: "" }), getStatus).length === 1);
    assert.equal(dans.length, 1, `membre ${x.id}`);
  }
});

test("statuts expirés et en attente", () => {
  assert.deepEqual(ids(filterMembers(members, f({ status: "EXPIRED", q: "" }), getStatus)), ["3"]);
  assert.deepEqual(ids(filterMembers(members, f({ status: "PENDING", q: "" }), getStatus)), ["4"]);
});

test("recherche : sans accent ni majuscule, nom dans les deux ordres", () => {
  const find = (q) => ids(filterMembers(members, f({ status: null, q }), getStatus));
  assert.deepEqual(find("AGBE"), ["2"]);
  assert.deepEqual(find("kofi ama"), ["1"]);
  assert.deepEqual(find("ama kofi"), ["1"]);
  assert.deepEqual(find("introuvable"), []);
});

test("recherche : téléphone sans espaces ni « + »", () => {
  const find = (q) => ids(filterMembers(members, f({ status: null, q }), getStatus));
  assert.deepEqual(find("90 12 34"), ["1"]);
  assert.deepEqual(find("+228 92"), ["3"]);
  // Une recherche sans chiffre ne doit pas tout renvoyer via le téléphone.
  assert.deepEqual(find("+"), []);
});

test("enfant sans téléphone : la recherche ne plante pas et ne le trouve pas par numéro", () => {
  const enfant = { ...m("5", "Kofi", "Kofi", null, "ACTIVE"), guardianName: "Ama Kofi" };
  const tous = [...members, enfant];
  const find = (q) => ids(filterMembers(tous, f({ status: null, q }), getStatus));
  assert.deepEqual(find("90 12 34"), ["1"]); // le parent seulement
  assert.deepEqual(find("kofi kofi"), ["5"]); // mais le nom fonctionne
});

test("statut et recherche se combinent", () => {
  assert.deepEqual(ids(filterMembers(members, f({ status: "EXPIRED", q: "ama" }), getStatus)), []);
  assert.deepEqual(ids(filterMembers(members, f({ status: "ACTIVE", q: "ama" }), getStatus)), ["1"]);
  assert.deepEqual(ids(filterMembers(members, f({ status: "ACTIVE", q: "agbe" }), getStatus)), []);
});

const catalogue = [
  full("1", "Musculation", "Mensuel", "Kossi A."),
  full("2", "Musculation", "Trimestriel", "Mme Dede"),
  full("3", "Danse", "Mensuel", "Mme Dede"),
  full("4", "Danse", "Mensuel", null),
];
const run = (changes) => ids(filterMembers(catalogue, f(changes), getStatus));

test("parse : activité, formule et coach lus, rognés, limités ; vides = absents", () => {
  const parsed = parseMemberFilters({ activite: " Danse ", formule: "Mensuel", coach: "Mme Dede" });
  assert.equal(parsed.activity, "Danse");
  assert.equal(parsed.formula, "Mensuel");
  assert.equal(parsed.coach, "Mme Dede");
  assert.equal(parseMemberFilters({ activite: "   " }).activity, null);
  assert.equal(parseMemberFilters({ coach: ["A", "B"] }).coach, "A");
  assert.equal(parseMemberFilters({ formule: "x".repeat(200) }).formula.length, 60);
});

test("adresse : ordre stable, valeurs par défaut omises, accents et espaces encodés", () => {
  assert.equal(
    buildMembersQuery(f({ status: "ACTIVE", activity: "Danse", formula: "Mensuel", coach: "Mme Dede" })),
    "?statut=actifs&activite=Danse&formule=Mensuel&coach=Mme+Dede",
  );
  assert.equal(buildMembersQuery(f({ coach: "Kossi A." })), "?coach=Kossi+A.");
  assert.deepEqual(activeMemberFilterParams(f({ activity: "Danse" })), [["activite", "Danse"]]);
});

test("aller-retour : lire(construire(filtres)) redonne les mêmes filtres", () => {
  const filters = f({ status: "EXPIRED", q: "ama", activity: "Gym enfant", formula: "Mensuel illimité", coach: "Mme Dede" });
  const params = Object.fromEntries(new URLSearchParams(buildMembersQuery(filters)));
  assert.deepEqual(parseMemberFilters(params), filters);
});

test("filtres activité, formule, coach : égalité exacte, combinables", () => {
  assert.deepEqual(run({ activity: "Danse" }), ["3", "4"]);
  assert.deepEqual(run({ formula: "Mensuel" }), ["1", "3", "4"]);
  assert.deepEqual(run({ coach: "Mme Dede" }), ["2", "3"]);
  assert.deepEqual(run({ activity: "Danse", coach: "Mme Dede" }), ["3"]);
  assert.deepEqual(run({ activity: "Musculation", formula: "Mensuel", coach: "Mme Dede" }), []);
  assert.deepEqual(run({ activity: "danse" }), []); // pas de correspondance partielle
});

test("filtre coach : les membres sans coach ne sont pas trouvés par un nom de coach", () => {
  assert.deepEqual(run({ coach: "Kossi A." }), ["1"]);
});

test("les nouveaux filtres se combinent avec le statut et la recherche", () => {
  assert.deepEqual(run({ activity: "Danse", q: "membre3" }), ["3"]);
  assert.deepEqual(run({ status: "EXPIRED", activity: "Danse" }), []);
});

test("listes déroulantes : sans doublon, sans null, triées à la française", () => {
  assert.deepEqual(listMemberFilterOptions(catalogue), {
    activities: ["Danse", "Musculation"],
    formulas: ["Mensuel", "Trimestriel"],
    coaches: ["Kossi A.", "Mme Dede"],
  });
  assert.deepEqual(listMemberFilterOptions([]), { activities: [], formulas: [], coaches: [] });
});
