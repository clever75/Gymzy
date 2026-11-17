# Journal de développement

Une entrée par fonctionnalité **terminée et vérifiée**, avec le numéro de la PR.
Ce journal raconte ce que **moi** j'ai fait et appris. Ce que le produit a gagné est dans [`CHANGELOG.md`](../CHANGELOG.md), et l'état des écrans dans [`docs/avancement.md`](avancement.md).
Le carnet de bord officiel du stage reste le document de l'école : on peut recopier ces entrées dedans.

## Règles

- On **ajoute à la fin**, on ne réécrit pas les anciennes entrées (c'est de l'histoire).
- Pas d'entrée avant que la fonctionnalité soit terminée et vérifiée.
- Trois lignes : *Ce qu'on a fait*, *À quoi ça sert*, *Ce que j'ai appris*. Une quatrième, *Reste à faire*, seulement si quelque chose était encore ouvert à ce moment-là.
- Ce qui reste à faire vit dans les Issues GitHub et les questions dans [`questions-ouvertes.md`](questions-ouvertes.md) : ici, c'est seulement une photo datée.
- Les passages marqués « à compléter » sont à écrire par la développeuse avec ses propres mots.

## Entrées

### 11 nov. 2026 · Socle visuel du dashboard (#1, #3)

- **Ce qu'on a fait :** tokens de couleurs en 3 couches (palette, rôles, composants), composants `Button`, `Badge`, `Card`, `Input`, `Field`, catalogue `/design`, puis correction des styles globaux.
- **À quoi ça sert :** avoir une base visuelle cohérente. Les composants n'utilisent que des rôles de couleur, car chaque salle aura la sienne (marque blanche).
- **Ce que j'ai appris :** à compléter.

### 11 nov. 2026 · Schéma Prisma des domaines 01 à 08 (#2)

- **Ce qu'on a fait :** schéma Prisma de l'API pour les huit domaines du schéma de référence, avec les migrations.
- **À quoi ça sert :** donner à l'API la structure de base de données décrite dans le cahier.
- **Ce que j'ai appris :** à compléter.

### 11 nov. 2026 · Formats, types, données factices et libellés (#4, #5, #6)

- **Ce qu'on a fait :** fonctions d'affichage des montants en F et des dates en français, types `Member` et `Payment`, données factices, libellés français et tons des badges.
- **À quoi ça sert :** afficher les mêmes formats partout et travailler l'interface avant que l'API existe.
- **Ce que j'ai appris :** à compléter.

### 12 nov. 2026 · Tableau paginé (#7)

- **Ce qu'on a fait :** composants `Table` et `Pagination`, fonction `paginate` (25 lignes par page, page invalide corrigée).
- **À quoi ça sert :** toutes les listes du dashboard doivent être paginées à 25 (règle du cahier).
- **Ce que j'ai appris :** à compléter.

### 12 nov. 2026 · Menu par rôle et identité de la salle (#8, #9)

- **Ce qu'on a fait :** menu latéral filtré selon le rôle et les modules actifs, nom et couleur de la salle appliqués à l'interface.
- **À quoi ça sert :** chaque utilisateur ne voit que ses écrans, et la salle retrouve sa marque.
- **Ce que j'ai appris :** à compléter. (Piste, d'après le code : masquer un lien n'est pas une protection, le serveur doit refuser lui-même.)

### 13 nov. 2026 · Page Paiements et recettes (#10, #11, #12, #13)

- **Ce qu'on a fait :** journal des paiements avec filtres (période, mode, statut, type, encaisseur), recherche, totaux, export CSV réservé à l'administrateur, tests de la logique, puis correction des totaux pour qu'ils suivent la liste filtrée.
- **À quoi ça sert :** voir et exporter les recettes selon des filtres, comme l'exige l'écran WEB-05.
- **Ce que j'ai appris :** à compléter. (Pistes, d'après le code : filtres dans l'adresse, fonctions pures testables avec Node, export CSV lisible par Excel.)
- **Reste à faire :** tri des colonnes, export Excel, couche d'accès aux données.

### 17 nov. 2026 · Organisation du dépôt (#14)

- **Ce qu'on a fait :** README, CHANGELOG, avancement par écran, décisions, modèle de PR et script `npm test`.
- **À quoi ça sert :** retrouver où en est le projet, ce qui a changé et pourquoi, et préparer le branchement à l'API.
- **Ce que j'ai appris :** chaque information a un seul endroit où vivre ; avec la fusion par squash, le titre de la PR devient le message du commit ; écrire une couche d'accès aux données évite de tout réécrire au branchement.
- **Reste à faire :** compléter le « Pourquoi » de la décision 0001, activer la fusion par squash sur GitHub.
