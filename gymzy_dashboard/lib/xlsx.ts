// Fabrication d'un fichier Excel (.xlsx) à partir d'en-têtes et de lignes.
// Parallèle de lib/csv.ts : mêmes en-têtes, mêmes lignes, autre format (DASH-03).
// L'écriture du fichier est confiée à « write-excel-file » : un .xlsx est un zip
// de plusieurs fichiers XML, on ne le fabrique pas à la main.
import writeExcelFile from "write-excel-file/node";

// Une cellule : texte, nombre, date (jour seulement) ou vide.
export type XlsxCell = string | number | Date | null;

// Largeur d'une colonne, en caractères : celle du contenu le plus long, bornée.
const MIN_WIDTH = 8;
const MAX_WIDTH = 40;

export function columnWidths(headers: string[], rows: XlsxCell[][]): number[] {
  return headers.map((header, column) => {
    let longest = header.length;
    for (const row of rows) {
      const cell = row[column];
      // Une date s'affiche sur 10 caractères (jj/mm/aaaa).
      const length = cell instanceof Date ? 10 : String(cell ?? "").length;
      if (length > longest) longest = length;
    }
    return Math.min(MAX_WIDTH, Math.max(MIN_WIDTH, longest + 2));
  });
}

// Chaque texte est écrit comme TEXTE (type String) : un nom qui commence par « = »
// n'est donc jamais calculé comme une formule, et « +228 … » garde son « + ».
function toCell(value: XlsxCell) {
  if (value === null) return null;
  if (value instanceof Date) return { value, format: "dd/mm/yyyy" };
  if (typeof value === "number") return { value, type: Number };
  return { value, type: String };
}

export async function buildXlsx(
  sheetName: string,
  headers: string[],
  rows: XlsxCell[][],
): Promise<Uint8Array<ArrayBuffer>> {
  const sheetData = [
    headers.map((header) => ({ value: header, type: String, fontWeight: "bold" as const })),
    ...rows.map((row) => row.map(toCell)),
  ];
  const columns = columnWidths(headers, rows).map((width) => ({ width }));
  const buffer = await writeExcelFile(sheetData, { sheet: sheetName, columns }).toBuffer();
  return new Uint8Array(buffer);
}
