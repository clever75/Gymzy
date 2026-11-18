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
  sortMembers,
  nextMemberSort,
  DEFAULT_MEMBER_SORT,
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

// --- Tri (USR-03) ---
const sm = (id, firstName, lastName, status, endDate) => ({
  ...m(id, firstName, lastName, "+228 90 00 00 0" + id, status),
  endDate,
});
const liste = [
  sm("1", "Yao", "Mensah", "ACTIVE", "2026-11-14"),
  sm("2", "Ama", "Kofi", "EXPIRED", "2026-09-20"),
  sm("3", "Kodjo", "Agbé", "PENDING", null),
  sm("4", "Efua", "Adjo", "ACTIVE", "2026-10-09"),
  sm("5", "Abla", "Zorro", "ACTIVE", null),
];
// Faux statut affiché : le membre « 4 » expire bientôt.
const statutAffiche = (x) => (x.id === "4" ? "EXPIRING_SOON" : x.status);
const trier = (key, direction) =>
  ids(sortMembers(liste, { key, direction }, statutAffiche));

test("parse tri : valeurs valides, ordre par défaut croissant", () => {
  assert.deepEqual(parseMemberFilters({ tri: "fin", ordre: "desc" }).sort, { key: "endDate", direction: "desc" });
  assert.deepEqual(parseMemberFilters({ tri: "statut" }).sort, { key: "status", direction: "asc" });
  assert.deepEqual(parseMemberFilters({ tri: "nom", ordre: "n'importe quoi" }).sort, { key: "name", direction: "asc" });
});

test("parse tri : valeur absente, inconnue ou piégée = ordre par défaut", () => {
  assert.deepEqual(parseMemberFilters({}).sort, DEFAULT_MEMBER_SORT);
  assert.deepEqual(parseMemberFilters({ tri: "telephone" }).sort, DEFAULT_MEMBER_SORT);
  assert.deepEqual(parseMemberFilters({ tri: "constructor", ordre: "desc" }).sort, DEFAULT_MEMBER_SORT);
  assert.deepEqual(parseMemberFilters({ tri: "__proto__" }).sort, DEFAULT_MEMBER_SORT);
});

test("adresse du tri : omis par défaut, présent sinon, aller-retour", () => {
  assert.equal(buildMembersQuery(f({ sort: DEFAULT_MEMBER_SORT })), "");
  assert.equal(buildMembersQuery(f({ sort: { key: "endDate", direction: "desc" } })), "?tri=fin&ordre=desc");
  assert.equal(
    buildMembersQuery(f({ status: "ACTIVE", activity: "Danse", sort: { key: "status", direction: "asc" } }), 2),
    "?statut=actifs&activite=Danse&tri=statut&ordre=asc&page=2",
  );
  const filters = f({ q: "ama", coach: "Mme Dede", sort: { key: "endDate", direction: "desc" } });
  const params = Object.fromEntries(new URLSearchParams(buildMembersQuery(filters)));
  assert.deepEqual(parseMemberFilters(params), filters);
});

test("clic sur un en-tête : croissant, puis décroissant, puis ordre par défaut", () => {
  const a = nextMemberSort(DEFAULT_MEMBER_SORT, "endDate");
  assert.deepEqual(a, { key: "endDate", direction: "asc" });
  const b = nextMemberSort(a, "endDate");
  assert.deepEqual(b, { key: "endDate", direction: "desc" });
  assert.deepEqual(nextMemberSort(b, "endDate"), DEFAULT_MEMBER_SORT);
  // Une autre colonne repart en croissant.
  assert.deepEqual(nextMemberSort(b, "status"), { key: "status", direction: "asc" });
});

test("tri par nom : nom puis prénom, sans tenir compte des accents", () => {
  // Adjo, Agbé, Kofi, Mensah, Zorro
  assert.deepEqual(trier("name", "asc"), ["4", "3", "2", "1", "5"]);
  assert.deepEqual(trier("name", "desc"), ["5", "1", "2", "3", "4"]);
});

test("tri par statut : l'urgence d'abord (expire bientôt, actif, en attente, expiré)", () => {
  // 4 expire bientôt ; 1 et 5 actifs (départagés par le nom : Mensah < Zorro) ; 3 en attente ; 2 expiré
  assert.deepEqual(trier("status", "asc"), ["4", "1", "5", "3", "2"]);
  // Décroissant : on inverse le critère, pas le départage (1 reste avant 5).
  assert.deepEqual(trier("status", "desc"), ["2", "3", "1", "5", "4"]);
});

test("tri par fin : les membres sans date restent à la fin dans les deux sens", () => {
  // Dates : 2 (20/09) < 4 (09/10) < 1 (14/11) ; sans date : 3 (Agbé) puis 5 (Zorro)
  assert.deepEqual(trier("endDate", "asc"), ["2", "4", "1", "3", "5"]);
  assert.deepEqual(trier("endDate", "desc"), ["1", "4", "2", "3", "5"]);
});

test("tri : égalité totale départagée par l'identifiant, ordre toujours identique", () => {
  const jumeaux = [
    sm("b", "Ama", "Kofi", "ACTIVE", null),
    sm("a", "Ama", "Kofi", "ACTIVE", null),
  ];
  const ordre = (x) => ids(sortMembers(x, { key: "endDate", direction: "asc" }, (y) => y.status));
  assert.deepEqual(ordre(jumeaux), ["a", "b"]);
  assert.deepEqual(ordre([...jumeaux].reverse()), ["a", "b"]);
});

test("tri : ne modifie pas la liste d'origine", () => {
  const copie = [...liste];
  sortMembers(liste, { key: "endDate", direction: "desc" }, statutAffiche);
  assert.deepEqual(ids(liste), ids(copie));
});
