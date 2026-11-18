# Questions ouvertes

Ce qu'on ne sait pas encore et qu'il faut faire confirmer.
Quand une question reçoit sa réponse : on note la réponse ici, puis on la transforme en décision (`docs/decisions/`) ou on met à jour [`avancement.md`](avancement.md).

| N° | Question | À qui | Posée le | Réponse | État |
|---|---|---|---|---|---|
| 1 | Seuil de « Expire bientôt » : 7 jours ? Le cahier ne le précise pas pour la puce de WEB-02. Le code utilise 7 jours. | Maître de stage | 17 nov. 2026 | 7 jours gardés provisoirement (décision de Clever, 17 nov.). À redemander. | Ouverte |
| 2 | Le staff peut-il exporter la liste des membres ? L'AUTH-11 ne lui interdit que l'export des recettes. | Maître de stage | 17 nov. 2026 | Oui : admin et staff, pas les coachs (décision de Clever, 17 nov. ; PR #19). À faire confirmer. | Tranchée provisoirement |
| 3 | Le menu doit-il aussi contenir « Séances » et « Notifications » (cahier §8.2) ? Ils ne sont pas dans `lib/navigation.ts`. | Maître de stage | 17 nov. 2026 | | Ouverte |
| 4 | La cinquième colonne de la maquette WEB-02, coupée dans le scan, est-elle la date de fin de période ? | Maître de stage | 17 nov. 2026 | | Ouverte |
| 5 | Police, couleurs d'erreur et d'avertissement, gris du texte secondaire : quelles valeurs retenir ? | Maître de stage ou développeur mobile | 17 nov. 2026 | | Ouverte |
| 6 | Comment et où afficher le logo de la salle ? | Maître de stage | 17 nov. 2026 | | Ouverte |
| 7 | Décision 0001 : compléter la partie « Pourquoi » avec ce que le maître de stage a dit. | Clever | 17 nov. 2026 | | Ouverte |
| 8 | Tri de la liste des membres : quelles colonnes doivent être triables, et quel ordre par défaut ? Le cahier dit seulement « tri » (USR-03). Le code trie par Membre, Statut (urgence d'abord) et Fin, et par défaut par nom croissant. | Maître de stage | 18 nov. 2026 | Choix provisoire : ceux du code. | Tranchée provisoirement |
| 9 | Colonne « Reçu » du journal des paiements : que proposer pour un paiement en cours, échoué ou remboursé ? La maquette montre seulement « PDF » (payé) et « Relancer » (en attente). Le code n'affiche rien (« — ») pour les autres statuts, et les boutons sont désactivés avant le branchement à l'API. | Maître de stage | 18 nov. 2026 | Choix provisoire : ceux du code. | Tranchée provisoirement |
| 10 | Tri du journal des paiements : quelles colonnes doivent être triables, et quel ordre par défaut ? Le cahier dit seulement « tri » (§9). Le code trie par Date, Membre et Montant, et par défaut du plus récent au plus ancien (un journal se lit ainsi). | Maître de stage | 18 nov. 2026 | Choix provisoire : ceux du code. | Tranchée provisoirement |
| 11 | Onglet « Journal » de la fiche membre (WEB-03) : que doit-il contenir ? Il figure dans la maquette, mais aucune exigence de WEB-03 ne le décrit, et le journal d'audit (ORG-10) est « à développer ». | Maître de stage | 18 nov. 2026 | | Ouverte |
| 12 | Carte de la fiche membre : afficher le numéro (ex. « GZ-000482 ») dépend de CARD-01, qui n'existe pas encore. Le code affiche « — » en attendant. | Maître de stage | 18 nov. 2026 | Choix provisoire : « — » tant que les cartes n'existent pas. | Tranchée provisoirement |