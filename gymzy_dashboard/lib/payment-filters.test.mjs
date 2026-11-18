// Tests des règles de gestion du journal des paiements.
// Lancer : node --test lib/payment-filters.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import {
  DEFAULT_PAYMENT_FILTERS as DEFAULTS,
  DEFAULT_PAYMENT_SORT,
  activeFilterParams,
  buildPaymentsQuery,
  computePaymentTotals,
  filterPayments,
  listCollectors,
  nextPaymentSort,
  parsePaymentFilters,
  periodRange,
  sortPayments,
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
    {
      period: "7j", method: "CARD", status: "COMPLETED", type: "PER_SESSION",
      collector: "Akua", q: "ama", sort: DEFAULT_PAYMENT_SORT,
    },
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
    sort: { key: "amountFinal", direction: "desc" },
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

test("totaux : seuls les paiements confirmés comptent, encaissé = espèces + mobile money + carte", () => {
  const month = computePaymentTotals(run({ period: "mois" }));
  assert.deepEqual(month, {
    collected: 27000, cash: 15000, mobileMoney: 12000, card: 0, discounts: 3000,
  });
  const all = computePaymentTotals(DATA);
  assert.deepEqual(all, {
    collected: 102000, cash: 20000, mobileMoney: 32000, card: 50000, discounts: 3000,
  });
  assert.equal(all.collected, all.cash + all.mobileMoney + all.card);
});

test("totaux : suivent la liste filtrée", () => {
  assert.deepEqual(
    computePaymentTotals(run({ period: "tout", collector: "Akua" })),
    { collected: 15000, cash: 15000, mobileMoney: 0, card: 0, discounts: 0 }, // l'id 7 est PROCESSING : non compté
  );
  assert.deepEqual(
    computePaymentTotals(run({ period: "tout", status: "PENDING" })),
    { collected: 0, cash: 0, mobileMoney: 0, card: 0, discounts: 0 },
  );
});

// ── Tri ─────────────────────────────────────────────────────────────────
const sorted = (sort) => sortPayments(DATA, sort).map((p) => p.id).join(",");

test("tri : par défaut, du plus récent au plus ancien", () => {
  assert.deepEqual(DEFAULT_PAYMENT_SORT, { key: "createdAt", direction: "desc" });
  assert.equal(sorted(DEFAULT_PAYMENT_SORT), "1,2,3,7,4,5,6,8");
  assert.equal(sorted({ key: "createdAt", direction: "asc" }), "8,6,5,4,7,3,2,1");
});

test("tri : par membre (sans accent ni majuscule), par montant", () => {
  // Noms affichés (prénom d'abord) : Ama, Efua, Éva, Hors, Mawuli, Mawusi, Test, Yao
  assert.equal(sorted({ key: "memberName", direction: "asc" }), "1,2,6,8,5,4,7,3");
  assert.equal(sorted({ key: "memberName", direction: "desc" }), "3,7,4,5,8,6,2,1");
  // montants payés : 1 = 12 000 ; 7 = 1 000 ; 8 = 5 000 ; les autres 15 000, 20 000, 50 000
  assert.equal(sorted({ key: "amountFinal", direction: "asc" }), "7,8,1,2,3,4,5,6");
  assert.equal(sorted({ key: "amountFinal", direction: "desc" }), "6,5,2,3,4,1,8,7");
});

test("tri : à égalité, le plus récent d'abord, puis l'identifiant (pages stables)", () => {
  // 2, 3 et 4 valent 15 000 : du plus récent (2) au plus ancien (4), dans les deux sens
  const asc = sorted({ key: "amountFinal", direction: "asc" }).split(",");
  const desc = sorted({ key: "amountFinal", direction: "desc" }).split(",");
  assert.deepEqual(asc.filter((id) => ["2", "3", "4"].includes(id)), ["2", "3", "4"]);
  assert.deepEqual(desc.filter((id) => ["2", "3", "4"].includes(id)), ["2", "3", "4"]);
  const same = [pay("b", "2026-10-01T10:00:00Z", "X", "CASH", "COMPLETED", 1000),
                pay("a", "2026-10-01T10:00:00Z", "X", "CASH", "COMPLETED", 1000)];
  assert.equal(sortPayments(same, DEFAULT_PAYMENT_SORT).map((p) => p.id).join(","), "a,b");
});

test("tri : la liste d'origine n'est pas modifiée", () => {
  const before = ids(DATA);
  sortPayments(DATA, { key: "memberName", direction: "asc" });
  assert.equal(ids(DATA), before);
});

test("tri : un clic sur une colonne fait défiler premier sens, sens inverse, ordre par défaut", () => {
  // Membre : croissant, décroissant, retour au défaut
  let sort = nextPaymentSort(DEFAULT_PAYMENT_SORT, "memberName");
  assert.deepEqual(sort, { key: "memberName", direction: "asc" });
  sort = nextPaymentSort(sort, "memberName");
  assert.deepEqual(sort, { key: "memberName", direction: "desc" });
  assert.deepEqual(nextPaymentSort(sort, "memberName"), DEFAULT_PAYMENT_SORT);
  // Date : l'ordre par défaut est déjà « récent d'abord » -> le clic donne « ancien d'abord », puis revient
  sort = nextPaymentSort(DEFAULT_PAYMENT_SORT, "createdAt");
  assert.deepEqual(sort, { key: "createdAt", direction: "asc" });
  assert.deepEqual(nextPaymentSort(sort, "createdAt"), DEFAULT_PAYMENT_SORT);
  // Depuis une autre colonne, la date repart de son premier sens (= le défaut)
  assert.deepEqual(nextPaymentSort({ key: "amountFinal", direction: "asc" }, "createdAt"), DEFAULT_PAYMENT_SORT);
});

test("tri : lecture et construction de l'adresse, valeur inconnue = défaut", () => {
  assert.deepEqual(parsePaymentFilters({ tri: "montant", ordre: "desc" }).sort, { key: "amountFinal", direction: "desc" });
  assert.deepEqual(parsePaymentFilters({ tri: "membre" }).sort, { key: "memberName", direction: "asc" });
  assert.deepEqual(parsePaymentFilters({ tri: "date", ordre: "zzz" }).sort, { key: "createdAt", direction: "asc" });
  for (const tri of ["constructor", "__proto__", "phone", "", "montant "]) {
    assert.deepEqual(parsePaymentFilters({ tri }).sort, DEFAULT_PAYMENT_SORT, JSON.stringify(tri));
  }
  assert.deepEqual(parsePaymentFilters({ tri: ["membre", "date"] }).sort, { key: "memberName", direction: "asc" });
  assert.equal(buildPaymentsQuery(DEFAULTS), ""); // le tri par défaut n'apparaît pas
  assert.equal(
    buildPaymentsQuery({ ...DEFAULTS, period: "tout", sort: { key: "amountFinal", direction: "desc" } }),
    "?periode=tout&tri=montant&ordre=desc",
  );
  assert.deepEqual(
    activeFilterParams({ ...DEFAULTS, sort: { key: "memberName", direction: "asc" } }),
    [["tri", "membre"], ["ordre", "asc"]],
  );
});

test("tri : les totaux ne changent pas avec le tri (ils portent sur la liste filtrée)", () => {
  const filtered = filterPayments(DATA, { ...DEFAULTS, period: "tout" }, NOW);
  const totals = computePaymentTotals(filtered);
  assert.deepEqual(computePaymentTotals(sortPayments(filtered, { key: "amountFinal", direction: "asc" })), totals);
});
