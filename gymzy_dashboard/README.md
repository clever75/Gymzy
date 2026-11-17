# Dashboard web Gymzy

Application web utilisée par l'administrateur et le staff d'une salle : membres, abonnements, paiements, cartes, média, événements, équipe, paramètres.

Technologies : Next.js (App Router), React, Tailwind v4, TypeScript. Icônes : Lucide.

## Commandes

```powershell
npm install
npm run dev      # http://localhost:3000
npm run lint
npm test         # tests de la logique (Node, sans navigateur)
npm run build
```

Le catalogue des composants est sur `/design` (hors du menu du dashboard).

## Organisation du code

| Dossier | Rôle |
|---|---|
| `app/(dashboard)/` | Les pages du dashboard (menu + en-tête communs). Le nom entre parenthèses n'apparaît pas dans l'adresse. |
| `app/design/` | Catalogue pour valider visuellement les composants. |
| `components/ui/` | Composants de base réutilisables (`Button`, `Badge`, `Table`, `Pagination`...). |
| `components/layout/` | Menu latéral et éléments de structure. |
| `components/<écran>/` | Composants propres à un écran (ex. `payments/`). |
| `lib/` | Logique sans React : formats, filtres, permissions, libellés, types. |
| `lib/mock/` | Données factices, **temporaires**. |

## Règles de code

1. **Couleurs** : seulement les rôles de couleur (`primary`, `surface`...) définis dans `app/globals.css`. Jamais une couleur en dur, car chaque salle a la sienne.
2. **Montants** : entiers en francs CFA, sans décimales, affichés avec `formatFcfa`.
3. **Logique en fonctions pures** dans `lib/`, avec un test (`*.test.mjs`) : elles se vérifient sans lancer l'application.
4. **Masquer n'est pas protéger** : cacher un bouton ou un lien est du confort. Le serveur doit refuser lui-même (comme la route d'export, qui répond 403).
5. **Les pages ne lisent pas les données factices directement** : elles passent par une couche d'accès aux données, pour que le branchement à l'API ne change qu'un seul endroit. Voir [`docs/decisions/0002-couche-d-acces-aux-donnees.md`](../docs/decisions/0002-couche-d-acces-aux-donnees.md).
6. **Les filtres, le tri et la page vivent dans l'adresse** (`?statut=payes&page=2`) : on peut partager un lien et revenir en arrière.

## Avant d'ouvrir une PR

- `npm run lint`, `npm test` et `npm run build` passent.
- `CHANGELOG.md` est à jour ; `docs/avancement.md` aussi si un écran a avancé.
