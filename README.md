# Gymzy

Plateforme SaaS multi-salles en marque blanche : salle de sport, studio de danse, académie.
Une même application sert plusieurs salles, chacune avec ses données isolées et sa propre couleur.

## Où en est-on ?

- Avancement écran par écran : [`docs/avancement.md`](docs/avancement.md)
- Historique des changements : [`CHANGELOG.md`](CHANGELOG.md)
- Décisions importantes et leurs raisons : [`docs/decisions/`](docs/decisions/)

## Structure du dépôt

| Dossier | Contenu | Technologies |
|---|---|---|
| `gymzy_dashboard/` | Dashboard web de la salle (en cours) | Next.js (App Router), React, Tailwind v4 |
| `api/` | API et schéma de base de données | NestJS, Prisma 7, PostgreSQL |
| `docs/` | Avancement et décisions | Markdown |

## Démarrer

Les commandes sont pour PowerShell (Windows). Prérequis : Node 22 ou plus récent, Git.

### Dashboard

```powershell
cd gymzy_dashboard
npm install
npm run dev        # http://localhost:3000
npm run lint       # vérifie le code
npm test           # lance les tests (Node)
npm run build      # vérifie que le projet se construit
```

Pour l'instant, le dashboard fonctionne avec des **données factices** : aucune API n'est nécessaire.
Le catalogue des composants est visible sur `/design`.

### API

```powershell
cd api
npm install
# Créer le fichier api/.env avec DATABASE_URL (base PostgreSQL locale).
# Ce fichier n'est JAMAIS commité.
npm run start:dev
npm test
```

## Règles de travail

- **Une branche par sujet**, partie de `main`, nommée `<type>/<quelques-mots>` : `feat/dashboard-membres`, `fix/paiements-totaux`, `docs/organisation-depot`.
  Types : `feat`, `fix`, `chore`, `docs`, `refactor`.
- **Messages de commit et titres de PR** au format `type: ce que fait le changement`, en français.
  Le titre de la PR devient le message du commit sur `main` : ce n'est **jamais** un lien.
- **Une PR = une idée**, terminée et vérifiée (lint, tests, build au vert).
- **À chaque PR** : mettre à jour `CHANGELOG.md` et, si un écran avance, `docs/avancement.md`.
- **Jamais dans Git** : clés, mots de passe, fichiers `.env`, `node_modules/`, fichiers générés.
