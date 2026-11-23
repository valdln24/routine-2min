/**
 * POST /api/lead
 * Reçoit le formulaire « Être recontacté » du quiz et vous l'envoie par email (via Resend).
 *
 * Réglages dans Cloudflare › Workers et Pages › routine-2min › Paramètres › Variables et secrets :
 *   RESEND_API_KEY  (Secret)  la clé Resend, commence par re_
 *   LEAD_TO         (Texte)   l'adresse qui reçoit les contacts
 *   EMAIL_FROM      (Texte, facultatif)  expéditeur ; par défaut « Diagnostic LR <onboarding@resend.dev> »
 */

const esc = v => String(v ?? "").replace(/[&<>"']/g, c => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" }[c]));
const clip = (v, n) => String(v ?? "").trim().slice(0, n);
const json = (data, status = 200) => new Response(JSON.stringify(data), { status, headers: { "content-type": "application/json; charset=utf-8" } });

export async function handleLead(request, env) {
  let body;
  try { body = await request.json(); } catch { return json({ ok:false, error:"Requête invalide." }, 400); }

  // champ piège invisible : rempli uniquement par les robots
  if (body.site) return json({ ok:true });

  const prenom = clip(body.prenom, 60);
  const telephone = clip(body.telephone, 30);
  const email = clip(body.email, 120);
  if (!prenom) return json({ ok:false, error:"Indiquez votre prénom." }, 400);
  if (!telephone && !email) return json({ ok:false, error:"Indiquez un téléphone ou un email." }, 400);
  if (telephone && !/^[+0-9 ().-]{6,30}$/.test(telephone)) return json({ ok:false, error:"Ce numéro de téléphone ne semble pas valide." }, 400);
  if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return json({ ok:false, error:"Cet email ne semble pas valide." }, 400);

  if (!env.RESEND_API_KEY || !env.LEAD_TO) {
    console.error("lead: RESEND_API_KEY ou LEAD_TO manquant");
    return json({ ok:false, error:"L'envoi n'est pas encore activé." }, 503);
  }

  const titre = clip(body.titre, 80);
  const total = clip(body.total, 20);
  const eco = clip(body.eco, 20);
  const profil = Array.isArray(body.profil) ? body.profil.slice(0, 10).map(([k, v]) => [clip(k, 30), clip(v, 80)]) : [];
  const routine = Array.isArray(body.routine) ? body.routine.slice(0, 10).map(p => clip(p, 80)) : [];

  const lignes = [
    ["Prénom", prenom], ["Téléphone", telephone || "non renseigné"], ["Email", email || "non renseigné"],
    ...profil,
    ["Coût routine (avec abonnements)", total ? `≈ ${total} par mois` : ""],
    ["Économie abonnement annoncée", eco ? `≈ ${eco} par mois` : ""]
  ].filter(([, v]) => v);

  const html = `
  <div style="font-family:Arial,sans-serif;max-width:560px;color:#0D1A14">
    <h2 style="margin:0 0 4px">Nouveau contact : ${esc(prenom)}</h2>
    <p style="margin:0 0 18px;color:#4A5A52">${esc(titre)}</p>
    <table style="border-collapse:collapse;width:100%">
      ${lignes.map(([k, v]) => `<tr><td style="padding:7px 10px 7px 0;color:#8A968F;border-bottom:1px solid #E2E7E1;width:38%">${esc(k)}</td><td style="padding:7px 0;border-bottom:1px solid #E2E7E1"><b>${esc(v)}</b></td></tr>`).join("")}
    </table>
    <h3 style="margin:22px 0 8px">Routine proposée</h3>
    <ul style="margin:0;padding-left:18px">${routine.map(p => `<li>${esc(p)}</li>`).join("")}</ul>
    ${telephone ? `<p style="margin:24px 0 0"><a href="tel:${esc(telephone.replace(/[^+0-9]/g, ""))}" style="background:#0C2219;color:#A6EBC1;padding:10px 16px;border-radius:99px;text-decoration:none">Appeler ${esc(prenom)}</a></p>` : ""}
  </div>`;
  const text = `Nouveau contact : ${prenom}\n${titre}\n\n` + lignes.map(([k, v]) => `${k} : ${v}`).join("\n") +
               `\n\nRoutine proposée :\n` + routine.map(p => `- ${p}`).join("\n");

  const r = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { "Authorization": `Bearer ${env.RESEND_API_KEY}`, "Content-Type": "application/json" },
    body: JSON.stringify({
      from: env.EMAIL_FROM || "Diagnostic LR <onboarding@resend.dev>",
      to: [env.LEAD_TO],
      reply_to: email || undefined,
      subject: `Nouveau contact : ${prenom}${titre ? " · " + titre.replace(/^Votre /, "") : ""}`,
      html, text
    })
  });
  if (!r.ok) {
    console.error("lead: Resend", r.status, await r.text());
    return json({ ok:false, error:"L'envoi a échoué." }, 502);
  }
  return json({ ok:true });
}
