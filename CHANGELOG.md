# Journal des changements

Une ligne par changement, avec le numéro de la PR. On écrit ce que ça **apporte**, pas les fichiers modifiés.
Format inspiré de [Keep a Changelog](https://keepachangelog.com/fr/1.1.0/).

## [Non publié]

### Ajouté

- Dashboard : socle visuel, avec tokens de couleurs en 3 couches, composants de base (`Button`, `Badge`, `Card`, `Input`, `Field`) et catalogue `/design` (#1)
- API : schéma Prisma des domaines 01 à 08 et migrations (#2)
- Dashboard : fonctions d'affichage des montants en F et des dates en français (#4)
- Dashboard : types `Member` et `Payment` et données factices (#5)
- Dashboard : libellés français et tons des badges de statut (#6)
- Dashboard : tableau paginé à 25 lignes (`Table`, `Pagination`) (#7)
- Dashboard : menu latéral selon le rôle et les modules actifs de la salle (#8)
- Dashboard : nom et couleur de la salle appliqués à l'interface (#9)
- Paiements : page « Paiements et recettes » avec journal, filtres, totaux et export CSV réservé à l'administrateur (#10)
- Paiements : filtres « type » et « encaisseur » (#11, #12)
- Dépôt : README, journal des changements, avancement par écran, décisions, modèle de PR et script `npm test` (#14)
- Dépôt : journal de développement et questions ouvertes (#15)

### Corrigé

- Dashboard : styles globaux (couche de base, noms des variables de police) (#3)
- Paiements : totaux calculés sur la liste filtrée (#13)
