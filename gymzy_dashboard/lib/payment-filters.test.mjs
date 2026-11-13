// Tests des règles de gestion du journal des paiements.
// Lancer : node --test lib/payment-filters.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PAYMENT_FILTERS as DEFAULTS,
  activeFilterParams,
  buildPaymentsQuery,
  computePaymentTotals,
  filterPayments,
  listCollectors,
  parsePaymentFilters,
  periodRange,
} from "./payment-filters.ts";

const NOW = new Date("2026-10-05T12:00:00Z");

// `extra` remplace des champs (type, confirmedBy) pour certaines lignes.
function pay(id, createdAt, memberName, method, status, amountOriginal, discount = 0, extra = {}) {
  return {
    id, createdAt, memberId: "m", memberName, type: "RENEWAL",
    amountOriginal, discount, amountFinal: amountOriginal - discount,
    method, status, confirmedBy: null,
    ...extra,
  };
}

const DATA = [
  pay("1", "2026-10-05T10:42:00Z", "Ama Kofi", "MOBILE_MONEY", "COMPLETED", 15000, 3000),
  pay("2", "2026-10-05T09:15:00Z", "Efua Adjo", "CASH", "COMPLETED", 15000, 0, { confirmedBy: "Akua" }),
  pay("3", "2026-10-05T08:50:00Z", "Yao Mensah", "MOBILE_MONEY", "PENDING", 15000),
  pay("4", "2026-10-01T16:40:00Z", "Mawusi Gbedey", "MOBILE_MONEY", "FAILED", 15000),
  pay("5", "2026-09-30T18:10:00Z", "Mawuli Dogbé", "MOBILE_MONEY", "COMPLETED", 20000, 0, { type: "EVENT_TICKET" }),
  pay("6", "2026-09-29T09:30:00Z", "Éva Kodjo", "CARD", "COMPLETED", 50000, 0, { type: "PER_SESSION" }),
  pay("7", "2026-10-04T23:59:59Z", "Test Cash", "CASH", "PROCESSING", 1000, 0, { confirmedBy: "Akua" }),
  pay("8", "2026-09-28T23:59:59Z", "Hors Période", "CASH", "COMPLETED", 5000, 0, { confirmedBy: "Élom Kossi" }),
];

const ids = (list) => list.map((p) => p.id).join(",");
const run = (over) => filterPayments(DATA, { ...DEFAULTS, ...over }, NOW);

test("lecture des filtres : valeurs valides", () => {
  assert.deepEqual(
    parsePaymentFilters({
      periode: "7j", mode: "carte", statut: "payes",
      type: "seance", encaisse: "  Akua  ", q: "  ama  ",
    }),
    { period: "7j", method: "CARD", status: "COMPLETED", type: "PER_SESSION", collector: "Akua", q: "ama" },
  );
});

test("lecture des filtres : absent, inconnu ou piégé -> valeurs par défaut", () => {
  assert.deepEqual(parsePaymentFilters({}), DEFAULTS);
  assert.deepEqual(
    parsePaymentFilters({ periode: "constructor", mode: "__proto__", statut: "x", type: "toString", encaisse: "   " }),
    DEFAULTS,
  );
});

test("lecture des filtres : tableau (premier élément) et textes limités à 60 caractères", () => {
  assert.equal(parsePaymentFilters({ statut: ["payes", "echoues"] }).status, "COMPLETED");
  assert.equal(parsePaymentFilters({ type: ["billet", "seance"] }).type, "EVENT_TICKET");
  assert.equal(parsePaymentFilters({ q: "a".repeat(100) }).q.length, 60);
  assert.equal(parsePaymentFilters({ encaisse: "a".repeat(100) }).collector.length, 60);
});

test("construction de l'adresse : défauts omis, ordre stable, page > 1", () => {
  assert.equal(buildPaymentsQuery(DEFAULTS), "");
  assert.equal(
    buildPaymentsQuery(
      { ...DEFAULTS, period: "7j", method: "CASH", type: "RENEWAL", collector: "Élom Kossi", q: "ama kofi" },
      2,
    ),
    "?periode=7j&mode=especes&type=renouvellement&encaisse=%C3%89lom+Kossi&q=ama+kofi&page=2",
  );
});

test("champs de formulaire : seuls les filtres non par défaut, sans recherche ni page", () => {
  assert.deepEqual(activeFilterParams(DEFAULTS), []);
  assert.deepEqual(
    activeFilterParams({
      ...DEFAULTS, period: "tout", method: "CARD", status: "FAILED",
      type: "EVENT_TICKET", collector: "Akua", q: "ama",
    }),
    [["periode", "tout"], ["mode", "carte"], ["statut", "echoues"], ["type", "billet"], ["encaisse", "Akua"]],
  );
});

test("aller-retour : lire(construire(filtres)) redonne les mêmes filtres", () => {
  const f = {
    period: "jour", method: "MOBILE_MONEY", status: "PENDING",
    type: "PER_SESSION", collector: "Élom Kossi", q: "yao",
  };
  const params = Object.fromEntries(new URLSearchParams(buildPaymentsQuery(f)));
  assert.deepEqual(parsePaymentFilters(params), f);
});

test("périodes : jour, 7 jours (bornes), mois, tout", () => {
  assert.equal(ids(run({ period: "jour" })), "1,2,3");
  assert.equal(ids(run({ period: "7j" })), "1,2,3,4,5,6,7"); // le 28/09 à 23:59 est exclu
  assert.equal(ids(run({ period: "mois" })), "1,2,3,4,7");
  assert.equal(ids(run({ period: "tout" })), "1,2,3,4,5,6,7,8");
  assert.equal(periodRange("tout", NOW), null);
});

test("filtres : mode, statut (en attente = PENDING + PROCESSING), recherche sans accent", () => {
  assert.equal(ids(run({ period: "tout", method: "CASH" })), "2,7,8");
  assert.equal(ids(run({ period: "tout", status: "PENDING" })), "3,7");
  assert.equal(ids(run({ period: "tout", q: "dogbe" })), "5");
  assert.equal(ids(run({ period: "tout", q: "AMA" })), "1");
  assert.equal(ids(run({ period: "mois", method: "CASH" })), "2,7");
});

test("filtre type : une seule valeur à la fois", () => {
  assert.equal(ids(run({ period: "tout", type: "PER_SESSION" })), "6");
  assert.equal(ids(run({ period: "tout", type: "EVENT_TICKET" })), "5");
  assert.equal(ids(run({ period: "tout", type: "RENEWAL" })), "1,2,3,4,7,8");
  assert.equal(ids(run({ period: "tout", type: "FIRST_SUBSCRIPTION" })), "");
});

test("filtre encaisseur : égalité exacte, combinable avec la période et les autres filtres", () => {
  assert.equal(ids(run({ period: "tout", collector: "Akua" })), "2,7");
  assert.equal(ids(run({ period: "tout", collector: "Élom Kossi" })), "8");
  assert.equal(ids(run({ period: "mois", collector: "Élom Kossi" })), ""); // payé le 28/09
  assert.equal(ids(run({ period: "tout", collector: "Personne" })), ""); // nom inconnu : 0 ligne
  assert.equal(ids(run({ period: "tout", collector: "Akua", status: "PENDING" })), "7");
  assert.equal(ids(run({ period: "tout", collector: "Akua", method: "MOBILE_MONEY" })), "");
});

test("liste des encaisseurs : sans doublon, sans null, triée", () => {
  assert.deepEqual(listCollectors(DATA), ["Akua", "Élom Kossi"]);
  assert.deepEqual(listCollectors([]), []);
});

test("totaux : seuls les paiements confirmés comptent, encaissé = espèces + en ligne", () => {
  const month = computePaymentTotals(run({ period: "mois" }));
  assert.deepEqual(month, { collected: 27000, cash: 15000, online: 12000, discounts: 3000 });
  const all = computePaymentTotals(DATA);
  assert.deepEqual(all, { collected: 102000, cash: 20000, online: 82000, discounts: 3000 });
  assert.equal(all.collected, all.cash + all.online);
});

test("totaux : suivent la liste filtrée", () => {
  assert.deepEqual(
    computePaymentTotals(run({ period: "tout", collector: "Akua" })),
    { collected: 15000, cash: 15000, online: 0, discounts: 0 }, // l'id 7 est PROCESSING : non compté
  );
  assert.deepEqual(
    computePaymentTotals(run({ period: "tout", status: "PENDING" })),
    { collected: 0, cash: 0, online: 0, discounts: 0 },
  );
});