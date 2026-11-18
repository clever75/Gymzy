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

### 17 nov. 2026 · Page Membres (#16, #17, #18, #19)

- **Ce qu'on a fait :** page « Membres » avec recherche (nom, téléphone), puces de statut, pagination à 25 et export CSV. Puis les puces sont devenues exclusives (comme les badges), les tests de la logique ont été ajoutés (dont un test CSV cassé corrigé), et l'export a été ouvert au staff.
- **À quoi ça sert :** retrouver un membre vite et en exporter la liste, comme l'exige WEB-02. Les règles sont écrites dans des tests : un changement de règle est voulu et visible.
- **Ce que j'ai appris :** à compléter. (Pistes : une règle qui change doit entraîner son test ; deux PR ouvertes peuvent se contredire, l'ordre de fusion compte ; `git stash` met un travail de côté sans le perdre ; une vérification faite sur la mauvaise branche ne prouve rien.)
- **Reste à faire :** couche d'accès aux données, `phone` nullable pour les enfants, filtres activité, formule et coach avec tri, export Excel.

### 17 nov. 2026 · Fusion par squash activée

- **Ce qu'on a fait :** réglage GitHub activé, la fusion par squash est possible.
- **À quoi ça sert :** le titre de la PR devient le message du commit sur `main`, ce qui garde un historique lisible (une PR = un commit).
- **Ce que j'ai appris :** à compléter.

### 17-18 nov. 2026 · Téléphone facultatif et couche d'accès aux données des membres (#20, #21, #22)

- **Ce qu'on a fait :** le téléphone d'un membre devient facultatif (un enfant n'a pas de numéro propre, USR-02), puis la liste, l'export et la fiche des membres passent par `lib/data/members.ts` au lieu de lire les données factices directement (ADR 0002). L'avancement est mis à jour.
- **À quoi ça sert :** quand l'API sera branchée, seul `lib/data/members.ts` changera, pas les écrans. Un type juste (`string | null`) fait signaler par TypeScript tous les endroits à corriger.
- **Ce que j'ai appris :** à compléter. (Pistes : corriger la donnée avant la structure ; une « couche d'accès » est une porte unique entre les pages et la source de données ; la couche de données ne s'invente pas : le filtre, le tri et la page sont des paramètres, comme pour l'API.)
- **Reste à faire :** la même couche pour les paiements.

### 18 nov. 2026 · Liste des membres complétée : filtres, tri, export Excel (#23, #24, #25)

- **Ce qu'on a fait :** filtres par activité, formule et coach (listes déroulantes alimentées par la couche de données), tri des colonnes Membre, Statut et Fin, et export Excel (`.xlsx`) avec les mêmes filtres et le même tri que le CSV. Nouvelle dépendance `write-excel-file`, choisie après comparaison (ADR 0003). Deux questions ouvertes ajoutées : colonnes triables et ordre par défaut (n° 8).
- **À quoi ça sert :** couvrir USR-03 (recherche, filtres, tri, pagination) et DASH-03 (export CSV et Excel) pour les membres. Dans le fichier Excel, les dates sont de vraies dates et un texte qui commence par « = » reste un texte (jamais une formule).
- **Ce que j'ai appris :** à compléter. (Pistes : le cahier dit « tri » sans préciser les colonnes : on fait le minimum et on note les choix en question ouverte ; un tri doit être stable (départage par nom puis identifiant) et se faire avant la pagination ; avant d'ajouter une dépendance, on compare taille, licence, maintenance et failles connues ; un test peut rouvrir le `.xlsx` produit, qui est un zip de fichiers XML.)
- **Reste à faire :** WEB-02 est terminée côté interface ; reste le branchement à l'API.

### 18 nov. 2026 · Journal des paiements : couche de données, maquette, tri (#26, #27, #28)

- **Ce qu'on a fait :** la page et l'export des paiements passent par `lib/data/payments.ts` (#26). Le journal est aligné sur la maquette WEB-05 (#27) : colonnes Réduction et Reçu, totaux espèces, mobile money, carte et réductions, boutons « PDF » et « Relancer » désactivés avant l'API. Les colonnes Date, Membre et Montant se trient, du plus récent au plus ancien par défaut (#28), avec un composant d'en-tête triable commun aux membres et aux paiements.
- **À quoi ça sert :** la page respecte la maquette et les exigences PAY-09 et PAY-10 du cahier, et les deux listes se comportent pareil. Les boutons désactivés montrent ce qui dépend de l'API sans faire croire que ça marche.
- **Ce que j'ai appris :** à compléter. (Pistes : comparer un écran à la maquette et au texte du cahier, qui peuvent dire des choses différentes ; vérifier la mise en page avec une capture à 1280 px, car un test ne voit pas une colonne coupée ; pour une colonne qui a déjà un ordre par défaut, le cycle des clics doit en tenir compte.)
- **Reste à faire :** export Excel des paiements, choix de dates « Période… », filtre par formule, confirmation des actions sensibles, branchement à l'API. Questions ouvertes n° 9 (colonne « Reçu ») et n° 10 (colonnes triables).

### 18 nov. 2026 · Fiche membre : socle et onglet Abonnements (#30)

- **Ce qu'on a fait :** nouveaux types `SubscriptionPeriod` et `MemberDetail`, données factices de la fiche (le cas d'Ama Kofi de la maquette) et `getMemberDetail` dans `lib/data/members.ts`. La page `/membres/[id]` affiche l'en-tête, le bandeau (statut, fin de période, prix convenu, carte), les six onglets dans l'adresse (`?onglet=`) et le tableau des périodes (ABO-09). Les boutons « Renouveler », « Modifier » et « ⋮ » sont désactivés. Deux questions ouvertes ajoutées (n° 11 et 12).
- **À quoi ça sert :** avancer WEB-03 sans attendre l'API : la page lit ses données par la couche d'accès, donc le branchement ne changera qu'un fichier. On garde `Member` pour la liste et on ajoute un type de détail, car l'API aura deux routes.
- **Ce que j'ai appris :** à compléter. (Pistes : une ligne de liste et une fiche complète n'ont pas les mêmes données, donc pas le même type ; un onglet dans l'adresse se partage et revient en arrière ; on désactive une action qui écrit au lieu de faire semblant ; les fonctions pures d'onglet et de période se testent sans lancer l'application.)
- **Reste à faire :** onglets Paiements, Séances, Famille, Carte et passages, Journal, actions de la fiche, branchement à l'API. Questions ouvertes n° 11 et 12.
