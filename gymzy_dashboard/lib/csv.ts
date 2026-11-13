// Génération de fichiers CSV lisibles par Excel en français.
// Fonctions pures, sans import : elles se testent avec Node.

// Excel en français attend « ; » comme séparateur (la virgule sert aux décimales).
const SEPARATOR = ";";
// Marque d'ordre des octets (BOM) : sans elle, Excel lit les accents de travers.
const BOM = "\uFEFF";
const NEWLINE = "\r\n";

// Un texte qui commence par = + - @ (ou tabulation / retour chariot) peut être
// exécuté comme une formule par Excel (« injection CSV »). On le neutralise
// avec une apostrophe devant.
const FORMULA_START = /^[=+\-@\t\r]/;

export function escapeCsvCell(value: string | number): string {
  let text = String(value);
  // Seuls les textes sont neutralisés : un nombre (même négatif) reste tel quel.
  if (typeof value === "string" && FORMULA_START.test(text)) text = `'${text}`;
  // Guillemets obligatoires si la cellule contient le séparateur, un guillemet
  // ou un saut de ligne ; un guillemet à l'intérieur est doublé.
  if (/[;"\r\n]/.test(text)) text = `"${text.replace(/"/g, '""')}"`;
  return text;
}

export function buildCsv(headers: string[], rows: (string | number)[][]): string {
  const lines = [headers, ...rows].map((row) => row.map(escapeCsvCell).join(SEPARATOR));
  return BOM + lines.join(NEWLINE) + NEWLINE;
}