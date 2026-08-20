# R.S V2

Cette V2 ajoute un vrai backend Express + SQLite et un espace d'administration protégé.

## Tester en local
1. Installer Node.js 20+.
2. Dans ce dossier : `npm install`
3. Définir `ADMIN_PASSWORD` et `SESSION_SECRET`.
4. Lancer : `npm start`
5. Ouvrir `http://localhost:3000`.

## Déploiement
Cette version nécessite un hébergeur capable d'exécuter Node.js et de conserver un fichier SQLite. Pour une vraie production, utilisez HTTPS, des secrets d'environnement et idéalement une base de données managée.

## Important
Le texte de confidentialité est un modèle. Avant de collecter réellement des données personnelles, complétez la politique de confidentialité et vérifiez le traitement au regard du RGPD. Ne mettez jamais le mot de passe administrateur dans le code.
