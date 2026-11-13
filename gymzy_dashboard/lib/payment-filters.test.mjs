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
  parsePaymentFilters,
  periodRange,
} from "./payment-filters.ts";

const NOW = new Date("2026-10-05T12:00:00Z");

function pay(id, createdAt, memberName, method, status, amountOriginal, discount = 0) {
  return {
    id, createdAt, memberId: "m", memberName, type: "RENEWAL",
    amountOriginal, discount, amountFinal: amountOriginal - discount,
    method, status, confirmedBy: null,
  };
}

const DATA = [
  pay("1", "2026-10-05T10:42:00Z", "Ama Kofi", "MOBILE_MONEY", "COMPLETED", 15000, 3000),
  pay("2", "2026-10-05T09:15:00Z", "Efua Adjo", "CASH", "COMPLETED", 15000),
  pay("3", "2026-10-05T08:50:00Z", "Yao Mensah", "MOBILE_MONEY", "PENDING", 15000),
  pay("4", "2026-10-01T16:40:00Z", "Mawusi Gbedey", "MOBILE_MONEY", "FAILED", 15000),
  pay("5", "2026-09-30T18:10:00Z", "Mawuli Dogbé", "MOBILE_MONEY", "COMPLETED", 20000),
  pay("6", "2026-09-29T09:30:00Z", "Éva Kodjo", "CARD", "COMPLETED", 50000),
  pay("7", "2026-10-04T23:59:59Z", "Test Cash", "CASH", "PROCESSING", 1000),
  pay("8", "2026-09-28T23:59:59Z", "Hors Période", "CASH", "COMPLETED", 5000),
];

const ids = (list) => list.map((p) => p.id).join(",");
const run = (over) => filterPayments(DATA, { ...DEFAULTS, ...over }, NOW);

test("lecture des filtres : valeurs valides", () => {
  assert.deepEqual(
    parsePaymentFilters({ periode: "7j", mode: "carte", statut: "payes", q: "  ama  " }),
    { period: "7j", method: "CARD", status: "COMPLETED", q: "ama" },
  );
});

test("lecture des filtres : absent, inconnu ou piégé -> valeurs par défaut", () => {
  assert.deepEqual(parsePaymentFilters({}), DEFAULTS);
  assert.deepEqual(
    parsePaymentFilters({ periode: "constructor", mode: "__proto__", statut: "x" }),
    DEFAULTS,
  );
});

test("lecture des filtres : tableau (premier élément) et recherche limitée à 60 caractères", () => {
  assert.equal(parsePaymentFilters({ statut: ["payes", "echoues"] }).status, "COMPLETED");
  assert.equal(parsePaymentFilters({ q: "a".repeat(100) }).q.length, 60);
});

test("construction de l'adresse : défauts omis, ordre stable, page > 1", () => {
  assert.equal(buildPaymentsQuery(DEFAULTS), "");
  assert.equal(
    buildPaymentsQuery({ ...DEFAULTS, period: "7j", method: "CASH", q: "ama kofi" }, 2),
    "?periode=7j&mode=especes&q=ama+kofi&page=2",
  );
});
test("champs de formulaire : seuls les filtres non par défaut, sans recherche ni page", () => {
  assert.deepEqual(activeFilterParams(DEFAULTS), []);
  assert.deepEqual(
    activeFilterParams({ ...DEFAULTS, period: "tout", method: "CARD", status: "FAILED", q: "ama" }),
    [["periode", "tout"], ["mode", "carte"], ["statut", "echoues"]],
  );
});
test("aller-retour : lire(construire(filtres)) redonne les mêmes filtres", () => {
  const f = { period: "jour", method: "MOBILE_MONEY", status: "PENDING", q: "yao" };
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

test("totaux : seuls les paiements confirmés comptent, encaissé = espèces + en ligne", () => {
  const month = computePaymentTotals(run({ period: "mois" }));
  assert.deepEqual(month, { collected: 27000, cash: 15000, online: 12000, discounts: 3000 });
  const all = computePaymentTotals(DATA);
  assert.deepEqual(all, { collected: 102000, cash: 20000, online: 82000, discounts: 3000 });
  assert.equal(all.collected, all.cash + all.online);
});