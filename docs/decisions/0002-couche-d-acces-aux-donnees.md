# 0002. Couche d'accès aux données

Date : 17 nov. 2026 · Statut : Acceptée (pas encore appliquée à WEB-05)

## Contexte

Le dashboard fonctionne avec des données factices. L'API sera branchée plus tard.
Aujourd'hui, la page Paiements et la route d'export importent toutes deux `mockPayments` et filtrent elles-mêmes la liste.
Au branchement, il faudrait réécrire les deux, et chaque nouvel écran répéterait le même défaut.

## Décision

Les pages et les routes ne lisent **jamais** les données factices directement.
Elles appellent des fonctions d'accès (`lib/data/…`) :

```ts
// Exemple d'intention, pas encore écrit
const result = await listPayments(filters, page);
// result : { items, totalItems, totals }
```

Règles :

1. **Les fonctions sont asynchrones**, comme le seront les appels à l'API (c'est déjà le cas de `getSession`).
2. **Filtres et page sont des paramètres.** L'API filtrera et paginera côté serveur : le dashboard ne doit pas charger toute la liste pour la découper.
3. **Les totaux viennent de la fonction**, calculés sur toute la liste filtrée et non sur la page affichée.
4. **Conversion à un seul endroit** : la réponse de l'API (JSON) est transformée en types du dashboard dans la couche d'accès. Les montants sont des entiers en FCFA.
5. **Les erreurs** sont gérées par la page (`error.tsx`, `loading.tsx`), pas par chaque composant.
6. **Le moteur de filtre actuel** (`lib/payment-filters.ts`, testé) sert à l'implémentation factice. Il n'est pas jeté.

## Pourquoi

- Brancher l'API ne change alors qu'un fichier par sujet, pas toutes les pages.
- On écrit l'interface comme si l'API existait : elle ne nous surprend pas ensuite.
- Les autres options étaient de garder les imports directs (rapide, mais coûteux à reprendre) ou d'appeler l'API depuis chaque composant (difficile à tester).

## Conséquences

- WEB-05 devra être adaptée (ticket à créer). C'est une petite refonte, sans changement visible.
- Chaque nouvel écran (WEB-02, 03...) est écrit directement avec cette couche.
- Le moment venu, `lib/mock/` pourra être supprimé sans toucher aux pages.
