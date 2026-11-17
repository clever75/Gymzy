// Tests de la génération CSV.
// Lancer : node --test lib/csv.test.mjs
import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCsv, escapeCsvCell } from "./csv.ts";

test("cellule simple : texte et nombres inchangés", () => {
  assert.equal(escapeCsvCell("Ama Kofi"), "Ama Kofi");
  assert.equal(escapeCsvCell(12000), "12000");
  assert.equal(escapeCsvCell(-3000), "-3000");
});

test("guillemets : séparateur, guillemet et saut de ligne", () => {
  assert.equal(escapeCsvCell("a;b"), '"a;b"');
  assert.equal(escapeCsvCell('dit "oui"'), '"dit ""oui"""');
  assert.equal(escapeCsvCell("ligne 1\nligne 2"), '"ligne 1\nligne 2"');
});

test("injection de formule : = + - @ neutralisés (textes seulement)", () => {
  assert.equal(escapeCsvCell("=1+1"), "'=1+1");
  assert.equal(escapeCsvCell("+SUM(A1)"), "'+SUM(A1)");
  assert.equal(escapeCsvCell("+1+1"), "'+1+1");
  assert.equal(escapeCsvCell("-2+3"), "'-2+3");
  assert.equal(escapeCsvCell("@SUM(A1)"), "'@SUM(A1)");
  assert.equal(
    escapeCsvCell('=HYPERLINK("http://x";"y")'),
    '"\'=HYPERLINK(""http://x"";""y"")"',
  );
});

test("fichier : BOM au début, point-virgule, fin de ligne CRLF", () => {
  const csv = buildCsv(["Membre", "Montant"], [["Ama Kofi", 12000], ["Efua; Adjo", 15000]]);
  assert.equal(csv, '\uFEFFMembre;Montant\r\nAma Kofi;12000\r\n"Efua; Adjo";15000\r\n');
  assert.ok(csv.startsWith("\uFEFF"));
});
// Un numéro de téléphone (« + », chiffres, espaces) reste lisible : pas d'apostrophe.
// Seule cette forme précise est exemptée ; tout le reste après un « + » est neutralisé.
test("téléphone international : laissé tel quel", () => {
  assert.equal(escapeCsvCell("+228 90 12 34 56"), "+228 90 12 34 56");
  assert.equal(escapeCsvCell("+22890123456"), "+22890123456");
});

test("téléphone : une formule déguisée en numéro reste neutralisée", () => {
  assert.equal(escapeCsvCell("+228(90)"), "'+228(90)");
  assert.equal(escapeCsvCell("+228;90"), `"'+228;90"`);
  assert.equal(escapeCsvCell("+"), "'+");
  assert.equal(escapeCsvCell("+228 90 12 34 56\n=1"), `"'+228 90 12 34 56\n=1"`);
});
