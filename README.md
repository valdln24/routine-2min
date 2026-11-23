# Routine en 2 minutes

Diagnostic « Trouvez votre routine LR idéale en 2 minutes » : quelques questions (besoin, activité, rythme, sport, moment difficile, budget), une analyse animée, puis une routine sur mesure. La personne peut laisser ses coordonnées (vous recevez un email) ou vous écrire directement sur WhatsApp, par appel ou SMS.

- `public/index.html` : toute la page. Vos informations : bloc `CONFIG` ; produits : bloc `P` ; questions : bloc `QUESTIONS`.
- `worker/` : le petit serveur qui envoie l'email quand quelqu'un remplit le formulaire.
- `wrangler.jsonc` : la configuration Cloudflare (aucun secret dedans).

## Mise en ligne (Cloudflare, gratuit) : comme Recharge
1. Cloudflare › **Workers et Pages** › **Créer** › **Importer un dépôt** (Import a repository) › GitHub › `routine-2min`.
   Si le dépôt n'apparaît pas : GitHub › Settings › Applications › **Cloudflare Workers and Pages** › Configure › ajoutez `routine-2min`.
2. Nom du projet : `routine-2min`. Commande de build : vide. Commande de déploiement : `npx wrangler deploy` (proposée par défaut).
3. Enregistrez : l'adresse sera du type `routine-2min.<votre-compte>.workers.dev`. Chaque modification poussée sur GitHub met le site à jour.

## Recevoir un email à chaque contact
1. Sur resend.com › API Keys › Create API Key (accès « Sending »), ou réutilisez celle de Recharge.
2. Cloudflare › Workers et Pages › `routine-2min` › Paramètres › Variables et secrets, ajoutez :
   - `RESEND_API_KEY` (Secret) : la clé ;
   - `LEAD_TO` (Texte) : votre adresse email.
3. Enregistrez (« Deploy »).

Sans nom de domaine validé chez Resend, l'email ne peut partir que vers l'adresse du compte Resend : mettez donc cette adresse dans `LEAD_TO`.

## Pour un développeur
```bash
npm install
npm run dev     # http://127.0.0.1:8790
```
