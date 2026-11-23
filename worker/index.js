// Petit serveur : sert la page (dossier public/) et reçoit le formulaire de contact.
import { handleLead } from "./lead.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    if (url.pathname === "/api/lead") {
      if (request.method !== "POST") return new Response("Méthode non autorisée", { status: 405 });
      try { return await handleLead(request, env); }
      catch (e) { console.error("lead", e && e.stack || e); return new Response(JSON.stringify({ ok:false, error:"Erreur serveur." }), { status: 500, headers: { "content-type": "application/json; charset=utf-8" } }); }
    }
    return env.ASSETS.fetch(request);
  }
};
