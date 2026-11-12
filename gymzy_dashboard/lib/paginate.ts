// Pagination : découpe une liste en pages. Fonction pure (aucune dépendance
// à React ni à Next.js), donc testable avec une simple commande node.
// Règle du cahier : 25 lignes par page.

export const PAGE_SIZE = 25;

export interface Page<T> {
  items: T[];        // les lignes de la page demandée
  page: number;      // page réellement affichée (corrigée si invalide), à partir de 1
  pageSize: number;
  totalItems: number;
  totalPages: number; // au moins 1, même pour une liste vide
}

export function paginate<T>(
  items: readonly T[],
  page: number,
  pageSize: number = PAGE_SIZE,
): Page<T> {
  const size = Math.max(1, Math.floor(pageSize));
  const totalItems = items.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / size));

  // On corrige au lieu de planter : une page 99 devient la dernière page,
  // une page 0 ou NaN devient la première.
  const safePage = Number.isFinite(page)
    ? Math.min(Math.max(Math.floor(page), 1), totalPages)
    : 1;

  const start = (safePage - 1) * size;
  return {
    items: items.slice(start, start + size),
    page: safePage,
    pageSize: size,
    totalItems,
    totalPages,
  };
}

// Lit le paramètre « ?page=... » d'une URL. Tout ce qui n'est pas un entier
// >= 1 (« abc », « -2 », « 2.5 », absent) donne la page 1.
export function parsePageParam(value: string | string[] | undefined): number {
  const raw = Array.isArray(value) ? value[0] : value;
  const n = Number(raw);
  return Number.isInteger(n) && n >= 1 ? n : 1;
}