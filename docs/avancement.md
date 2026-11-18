# Avancement du dashboard web

Mis à jour le 18 nov. 2026, d'après l'état de `main` après la PR #21.

**États** : À faire · En cours · Fait (données factices) · Branché à l'API.
Un écran n'est « Branché » que lorsqu'il lit et écrit réellement via l'API.

## Les 10 écrans (cahier des charges, §9.2)

| Écran | État | Ce qui manque |
|---|---|---|
| WEB-01 Tableau de bord | À faire | Page vide (placeholder) |
| WEB-02 Membres | En cours (données factices) | Liste, recherche, puces de statut, pagination et export CSV (admin et staff) sont faits. Un enfant n'a pas de téléphone propre (USR-02). La page, l'export et la fiche passent par la couche d'accès aux données (ADR 0002). Les filtres activité, formule et coach sont faits (USR-03). Le tri des colonnes Membre, Statut et Fin est fait (USR-03). L'export Excel des membres est fait (DASH-03, ADR 0003). Reste : branchement API |
| WEB-03 Fiche membre | À faire | Page provisoire (le lien depuis la liste existe) |
| WEB-04 Activités et formules | À faire | Page vide |
| WEB-05 Paiements et recettes | Fait (données factices) | Tri des colonnes, export Excel (règle du cahier §8.2), confirmation des actions sensibles, écarts avec la maquette, branchement API. La page et l'export passent par la couche d'accès aux données (ADR 0002) |
| WEB-06 Cartes et accès | À faire | Page vide, module `membershipCard` |
| WEB-07 Média | À faire | Page vide, module `media` |
| WEB-08 Événements | À faire | Page vide, module `ticketing` |
| WEB-09 Équipe | À faire | Page vide |
| WEB-10 Paramètres | À faire | Page vide |

## Éléments transversaux

| Élément | État | Remarque |
|---|---|---|
| Socle visuel (tokens, composants, `/design`) | Fait | Reste à trancher : police, couleurs d'erreur et d'avertissement, gris du texte secondaire |
| Menu par rôle et modules actifs | Fait (données factices) | Masque seulement les liens : la vraie protection sera côté API |
| Identité de la salle (nom, couleur) | Fait (données factices) | Le logo n'est pas encore affiché |
| Connexion (AUTH-05) | À faire | La session actuelle est factice (`lib/session.ts`) |
| Couche d'accès aux données | Fait | Membres (`lib/data/members.ts`) et paiements (`lib/data/payments.ts`). Seule la page de démonstration `/design` lit encore `lib/mock`. |
| Branchement à l'API | À faire | Après la couche d'accès aux données |
| Tests | En cours | 71 tests de logique pure. La couche d'accès n'est pas testée directement. Pas de tests de composants ni de bout en bout. |
| Accessibilité | À auditer | Contrastes, clavier, libellés |
| Utilisable dès 768 px | À vérifier | Conçu pour 1280 px et plus |