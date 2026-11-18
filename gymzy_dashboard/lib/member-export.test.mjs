// Tests de la transformation des membres en lignes CSV (WEB-02).
// Lancer : node --test lib/member-export.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCsv } from "./csv.ts";
import { MEMBER_EXPORT_HEADERS, membersToCsvRows, membersToSheetRows } from "./member-export.ts";
import { formatMemberName, isChild } from "./member-display.ts";

const context = {
  statusLabel: (x) => `statut:${x.status}`,
  date: (iso) => iso.slice(8, 10) + "/" + iso.slice(5, 7) + "/" + iso.slice(0, 4),
};
const member = {
  id: "1", firstName: "Ama", lastName: "Kofi", phone: "+228 90 12 34 56",
  guardianName: null, activity: "Musculation", formula: "Mensuel",
  status: "ACTIVE", coachName: "Kossi A.", endDate: "2026-10-28",
};

test("une ligne : ordre des colonnes, valeurs absentes = cellule vide (jamais « null »)", () => {
  assert.deepEqual(membersToCsvRows([member], context), [
    ["Kofi", "Ama", "+228 90 12 34 56", "", "Musculation", "Mensuel",
     "statut:ACTIVE", "28/10/2026", "Kossi A."],
  ]);
  const [row] = membersToCsvRows([{ ...member, endDate: null, coachName: null }], context);
  assert.equal(row[7], "");
  assert.equal(row[8], "");
});

test("enfant sans téléphone : cellule vide, jamais « null »", () => {
  const [row] = membersToCsvRows([{ ...member, phone: null, guardianName: "Ama Kofi" }], context);
  assert.equal(row[2], "");
  assert.equal(row[3], "Ama Kofi");
});

test("enfant : le parent apparaît dans « Parent / tuteur »", () => {
  const [row] = membersToCsvRows([{ ...member, guardianName: "Ama Kofi" }], context);
  assert.equal(row[3], "Ama Kofi");
});

test("autant de cellules que d'en-têtes", () => {
  for (const row of membersToCsvRows([member], context)) {
    assert.equal(row.length, MEMBER_EXPORT_HEADERS.length);
  }
});

test("CSV final : téléphone lisible, nom piégé neutralisé", () => {
  const csv = buildCsv(
    MEMBER_EXPORT_HEADERS,
    membersToCsvRows([{ ...member, lastName: "=1+1" }], context),
  );
  assert.ok(csv.includes(";+228 90 12 34 56;"));
  assert.ok(csv.includes("'=1+1;"));
});

test("affichage du nom : nom de famille en majuscules ; enfant = a un parent", () => {
  assert.equal(formatMemberName(member), "Ama KOFI");
  assert.equal(isChild(member), false);
  assert.equal(isChild({ guardianName: "Ama Kofi" }), true);
});

test("Excel : mêmes colonnes que le CSV, mais « Fin » est une vraie date", () => {
  const [csv] = membersToCsvRows([member], context);
  const [sheet] = membersToSheetRows([member], context);
  assert.equal(sheet.length, MEMBER_EXPORT_HEADERS.length);
  for (const i of [0, 1, 2, 3, 4, 5, 6, 8]) assert.equal(sheet[i], csv[i], `colonne ${i}`);
  assert.ok(sheet[7] instanceof Date);
  assert.equal(sheet[7].toISOString(), "2026-10-28T00:00:00.000Z");
});

test("Excel : pas de date de fin ou pas de téléphone = cellule vide", () => {
  const [row] = membersToSheetRows([{ ...member, endDate: null, phone: null }], context);
  assert.equal(row[7], null);
  assert.equal(row[2], "");
});

test("Excel : une date et heure complète est gardée telle quelle", () => {
  const [row] = membersToSheetRows([{ ...member, endDate: "2026-10-28T10:30:00Z" }], context);
  assert.equal(row[7].toISOString(), "2026-10-28T10:30:00.000Z");
});
