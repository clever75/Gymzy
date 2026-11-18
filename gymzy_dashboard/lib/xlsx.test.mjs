// Tests de la fabrication du fichier Excel (.xlsx).
// Lancer : node --test lib/xlsx.test.mjs
// Un .xlsx est un zip de fichiers XML : on le rouvre pour vérifier son contenu.
import { test } from "node:test";
import assert from "node:assert/strict";
import { strFromU8, unzipSync } from "fflate";
import { buildXlsx, columnWidths } from "./xlsx.ts";

async function read(headers, rows) {
  const files = unzipSync(await buildXlsx("Feuille", headers, rows));
  return {
    files,
    sheet: strFromU8(files["xl/worksheets/sheet1.xml"]),
    texts: strFromU8(files["xl/sharedStrings.xml"] ?? new Uint8Array()),
    workbook: strFromU8(files["xl/workbook.xml"]),
  };
}

test("le résultat est un vrai fichier .xlsx (zip avec classeur et feuille)", async () => {
  const bytes = await buildXlsx("Membres", ["Nom"], [["Ama"]]);
  assert.equal(String.fromCharCode(bytes[0], bytes[1]), "PK"); // signature d'un zip
  const { files, workbook } = await read(["Nom"], [["Ama"]]);
  assert.ok(files["[Content_Types].xml"]);
  assert.ok(workbook.includes('name="Feuille"'));
});

test("en-têtes et textes présents, une ligne de données par membre", async () => {
  const { sheet, texts } = await read(["Nom", "Prénom"], [["Kofi", "Ama"], ["Mensah", "Yao"]]);
  for (const word of ["Nom", "Prénom", "Kofi", "Ama", "Mensah", "Yao"]) {
    assert.ok(texts.includes(word), word);
  }
  assert.equal((sheet.match(/<row /g) ?? []).length, 3); // en-têtes + 2 lignes
});

test("texte piégé : « =… » reste du texte, jamais une formule", async () => {
  const { sheet, texts } = await read(["Nom"], [["=1+1"], ["+SUM(A1)"], ["@x"]]);
  assert.ok(texts.includes("=1+1"));
  assert.ok(texts.includes("+SUM(A1)"));
  assert.equal(sheet.includes("<f>"), false); // aucune formule dans la feuille
});

test("téléphone : le « + » est conservé (texte, pas nombre)", async () => {
  const { texts } = await read(["Téléphone"], [["+228 90 12 34 56"]]);
  assert.ok(texts.includes("+228 90 12 34 56"));
});

test("date : vraie date Excel (28/10/2026 = 46323), même dans un autre fuseau", async () => {
  const { sheet } = await read(["Fin"], [[new Date("2026-10-28T00:00:00Z")]]);
  assert.ok(sheet.includes("<v>46323</v>"));
});

test("nombre : écrit comme nombre ; cellule vide : aucune valeur", async () => {
  const { sheet } = await read(["Montant", "Vide"], [[15000, null]]);
  assert.ok(sheet.includes("<v>15000</v>"));
});

test("aucune ligne : le fichier garde ses en-têtes", async () => {
  const { sheet, texts } = await read(["Nom", "Prénom"], []);
  assert.equal((sheet.match(/<row /g) ?? []).length, 1);
  assert.ok(texts.includes("Prénom"));
});

test("largeurs : au contenu le plus long, entre 8 et 40 caractères", () => {
  const widths = columnWidths(["A", "Nom complet", "Long"], [
    ["x", "Ama KOFI", "y".repeat(100)],
    ["xx", "Yao", new Date()],
  ]);
  assert.equal(widths[0], 8); // minimum
  assert.equal(widths[1], 13); // « Nom complet » (11) + 2
  assert.equal(widths[2], 40); // maximum
});
