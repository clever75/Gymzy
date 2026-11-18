# 0003. Bibliothèque pour l'export Excel

Date : 18 nov. 2026 · Statut : Acceptée

## Contexte

Le cahier des charges (DASH-03, priorité P1) demande d'exporter les membres, les transactions et les passages « en CSV et Excel, selon les filtres affichés ».
Le CSV est déjà fait (`lib/csv.ts`). Un fichier Excel (`.xlsx`) est un zip de plusieurs fichiers XML : l'écrire à la main est long et fragile à tester.
Ces fichiers contiennent des données personnelles (téléphones) : la bibliothèque doit être sûre et maintenue.

## Décision

On utilise **`write-excel-file`** (version 4, import `write-excel-file/node`), derrière une seule fonction `buildXlsx` dans `lib/xlsx.ts`.
Elle reçoit les mêmes en-têtes et les mêmes lignes que `buildCsv` : chaque écran fabrique ses lignes une fois, puis choisit le format (`?format=xlsx`, CSV par défaut).

## Pourquoi

| Option | Taille | Dépendances | Remarque |
|---|---|---|---|
| `write-excel-file` | 1,8 Mo | 1 (`fflate`) | Licence MIT, mise à jour en juin 2026, écrit en mémoire (`toBuffer()`) |
| `exceljs` | 21 Mo | une douzaine | Dernière version en décembre 2024 |
| `xlsx` (npm) | 7,5 Mo | 7 | Version 0.18.5, ancienne et signalée pour des failles de sécurité (à ma connaissance) |

- Un vrai `.xlsx` apporte des dates réelles, des nombres réels, des largeurs de colonnes lisibles.
- Un texte écrit comme texte (`type: String`) n'est **jamais** calculé comme une formule : l'apostrophe de protection du CSV n'est pas nécessaire. Un test le vérifie.
- Les failles signalées par `npm audit` (15 au 18 nov.) viennent des outils de développement (eslint, glob) et existaient avant : aucune ne vient de cette bibliothèque.

## Conséquences

- Une dépendance de plus à surveiller (mises à jour, `npm audit`).
- La même fonction servira à l'export des paiements (WEB-05) et, plus tard, des passages.
- Si la bibliothèque disparaît, seul `lib/xlsx.ts` change.
