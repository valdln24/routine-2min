# Routine en 2 minutes

Diagnostic « Trouvez votre routine LR idéale en 2 minutes » : quelques questions (besoin, activité, rythme, sport, moment difficile, budget), une analyse animée, puis une routine sur mesure. La personne peut laisser ses coordonnées (vous recevez un email) ou vous écrire directement sur WhatsApp, par appel ou SMS.

- `index.html` : toute la page. Vos informations : bloc `CONFIG` ; produits : bloc `P` ; questions : bloc `QUESTIONS`.
- `functions/api/lead.js` : envoie l'email quand quelqu'un remplit le formulaire.

## Mise en ligne (Cloudflare Pages, gratuit)
Cloudflare › Workers et Pages › Créer › Pages › Connecter à Git › `routine-2min`.
Préréglage : Aucun. Commande de build : vide. Répertoire de sortie : `/`.

## Recevoir un email à chaque contact
1. Sur resend.com › API Keys › Create API Key (accès « Sending »). Copiez la clé `re_…`.
2. Cloudflare › Pages › `routine-2min` › Paramètres › Variables et secrets, ajoutez :
   - `RESEND_API_KEY` (Secret) : la clé ;
   - `LEAD_TO` (Texte) : votre adresse email.
3. Redéployez (Déploiements › … › Réessayer le déploiement).

Sans nom de domaine validé chez Resend, l'email ne peut partir que vers l'adresse du compte Resend : mettez donc cette adresse dans `LEAD_TO`.
