// Calcul du thème d'une salle à partir de sa couleur primaire (ORG-04).
// Fonctions pures : mêmes entrées, même résultat, testables avec Node.

// Valeurs de la palette (globals.css, couche 1).
// À GARDER IDENTIQUES à --gz-ink-950 et --gz-white.
// INK sert à la fois de fond de l'app et de texte sombre sur primary.
const INK = "#111014";
const LIGHT = "#f5f3f8";

// La couleur vient de l'API : on n'accepte que #RRGGBB avant de l'écrire dans le CSS.
const HEX = /^#[0-9a-f]{6}$/i;

function toRgb(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

// Luminance relative (WCAG) : 0 = noir, 1 = blanc.
function luminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((v) => {
    const c = v / 255;
    return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Rapport de contraste entre deux couleurs : de 1 (identiques) à 21 (noir/blanc).
export function contrastRatio(a: string, b: string): number {
  const la = luminance(a);
  const lb = luminance(b);
  const hi = Math.max(la, lb);
  const lo = Math.min(la, lb);
  return (hi + 0.05) / (lo + 0.05);
}

export type BrandTheme = {
  primary: string;
  onPrimary: string;
  // Contraste du texte sur primary. AA = 4,5 ; en dessous, l'écran Paramètres
  // devra avertir la salle (WEB-10).
  onPrimaryRatio: number;
};

// Renvoie null si la couleur est absente, invalide ou inutilisable :
// l'appelant garde alors la palette par défaut.
export function resolveBrandTheme(
  primaryColor: string | null | undefined,
): BrandTheme | null {
  if (!primaryColor || !HEX.test(primaryColor)) return null;

  const withInk = contrastRatio(primaryColor, INK);
  const withLight = contrastRatio(primaryColor, LIGHT);

  // primary est aussi utilisé sur le fond sombre (texte, pastille, bordure) :
  // 3:1 minimum, sinon il disparaît.
  if (withInk < 3) return null;

  const useInk = withInk >= withLight;
  return {
    primary: primaryColor.toLowerCase(),
    onPrimary: useInk ? INK : LIGHT,
    onPrimaryRatio: Math.round(Math.max(withInk, withLight) * 100) / 100,
  };
}