'use strict';
const axios = require('axios');

const BREVO_API_URL = 'https://api.brevo.com/v3/smtp/email';

// ── Échappement HTML (protection XSS dans les emails) ────
const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;');

// ── Couleurs charte FaStyle ───────────────────────────────
const C = {
  olive:      '#6c8a2c',
  oliveDark:  '#567022',
  cream:      '#ebe1d8',
  cream50:    '#faf7f4',
  ivory:      '#fffbe9',
  ink:        '#111111',
  inkSoft:    '#333333',
  inkMuted:   '#666666',
};

// ── Layout commun ─────────────────────────────────────────
const layout = (content) => `
<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>FaStyle</title>
</head>
<body style="margin:0;padding:0;background-color:${C.cream50};font-family:'DM Sans',Helvetica,Arial,sans-serif;color:${C.ink};">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.cream50};padding:40px 16px;">
    <tr>
      <td align="center">
        <table width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;">

          <!-- Header -->
          <tr>
            <td align="center" style="background-color:${C.ink};border-radius:16px 16px 0 0;padding:32px 40px;">
              <span style="font-family:Georgia,serif;font-size:28px;font-weight:700;color:#ffffff;letter-spacing:-0.5px;">
                Fa<span style="color:${C.olive};">Style</span>
              </span>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="background-color:#ffffff;padding:40px;border-left:1px solid ${C.cream};border-right:1px solid ${C.cream};">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td align="center" style="background-color:${C.cream};border-radius:0 0 16px 16px;padding:24px 40px;">
              <p style="margin:0;font-size:12px;color:${C.inkMuted};">© ${new Date().getFullYear()} FaStyle · Tous droits réservés</p>
              <p style="margin:6px 0 0;font-size:12px;color:${C.inkMuted};">Vous recevez cet email car vous êtes client(e) FaStyle.</p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;

// ── Badge statut ──────────────────────────────────────────
const badge = (label, bg = C.olive, color = '#fff') =>
  `<span style="display:inline-block;background-color:${bg};color:${color};font-size:12px;font-weight:600;padding:4px 12px;border-radius:20px;">${label}</span>`;

// ── Ligne recap ───────────────────────────────────────────
const row = (label, value, highlight = false) => `
  <tr>
    <td style="padding:10px 0;border-bottom:1px solid ${C.cream};font-size:14px;color:${C.inkMuted};">${label}</td>
    <td style="padding:10px 0;border-bottom:1px solid ${C.cream};font-size:14px;font-weight:${highlight ? '700' : '500'};color:${highlight ? C.olive : C.inkSoft};text-align:right;">${value}</td>
  </tr>`;

// ── Bouton CTA ────────────────────────────────────────────
const cta = (label, href) =>
  `<a href="${href}" style="display:inline-block;margin-top:28px;background-color:${C.olive};color:#ffffff;font-size:14px;font-weight:600;padding:14px 32px;border-radius:12px;text-decoration:none;">${label}</a>`;

// ── Envoi via API Brevo ───────────────────────────────────
const send = (to, subject, htmlContent) =>
  axios.post(
    BREVO_API_URL,
    {
      sender: {
        name:  process.env.BREVO_FROM_NAME  || 'FaStyle',
        email: process.env.BREVO_FROM_EMAIL || 'noreply@fastyle.fr',
      },
      to: [{ email: to.email, name: to.full_name }],
      subject,
      htmlContent,
    },
    {
      headers: {
        'api-key': process.env.BREVO_API_KEY,
        'Content-Type': 'application/json',
      },
    }
  );

// ─────────────────────────────────────────────────────────
// 2. Confirmation de réservation
// ─────────────────────────────────────────────────────────
const sendReservationConfirmation = (user, reservation, service) => {
  const periodLabels = { morning: 'Matin', afternoon: 'Après-midi', evening: 'Soir' };
  const reste = (reservation.total_price - reservation.deposit_amount).toFixed(2);

  return send(
    user,
    '✅ Votre réservation est confirmée',
    layout(`
      <div style="display:inline-block;margin-bottom:20px;">
        ${badge('Réservation confirmée')}
      </div>
      <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:${C.ink};margin:0 0 8px;">
        C'est tout bon, ${esc(user.full_name)} !
      </h1>
      <p style="font-size:15px;color:${C.inkMuted};line-height:1.6;margin:0 0 28px;">
        Votre réservation a bien été enregistrée. Voici le récapitulatif :
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:28px;">
        ${row('Prestation', esc(service.name))}
        ${row('Date', new Date(reservation.reservation_date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }))}
        ${row('Créneau', periodLabels[reservation.slot?.period] || '')}
        ${row('Acompte réglé', `${Number(reservation.deposit_amount).toFixed(2)} €`)}
        ${row('Reste à payer sur place', `${reste} €`, true)}
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.ivory};border-left:4px solid ${C.olive};border-radius:0 8px 8px 0;margin-bottom:8px;">
        <tr>
          <td style="padding:16px 20px;font-size:13px;color:${C.inkSoft};line-height:1.6;">
            💡 Le solde de <strong>${reste} €</strong> sera à régler directement lors de votre rendez-vous.
          </td>
        </tr>
      </table>
    `)
  );
};

// ─────────────────────────────────────────────────────────
// 3. Annulation de réservation
// ─────────────────────────────────────────────────────────
const sendReservationCancellation = (user, reservation, refunded = true) =>
  send(
    user,
    '❌ Annulation de votre réservation',
    layout(`
      <div style="display:inline-block;margin-bottom:20px;">
        ${badge('Réservation annulée', '#ef4444')}
      </div>
      <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:${C.ink};margin:0 0 8px;">
        Votre réservation a été annulée
      </h1>
      <p style="font-size:15px;color:${C.inkMuted};line-height:1.6;margin:0 0 28px;">
        Bonjour ${esc(user.full_name)}, votre réservation du
        <strong>${new Date(reservation.reservation_date + 'T12:00:00').toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' })}</strong>
        a été annulée.
      </p>

      ${refunded ? `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#fef2f2;border-left:4px solid #ef4444;border-radius:0 8px 8px 0;margin-bottom:28px;">
        <tr>
          <td style="padding:16px 20px;font-size:13px;color:${C.inkSoft};line-height:1.6;">
            💳 L'acompte de <strong>${Number(reservation.deposit_amount).toFixed(2)} €</strong> vous sera remboursé sous <strong>3 à 5 jours ouvrés</strong>.
          </td>
        </tr>
      </table>
      ` : `
      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.cream50};border-radius:8px;margin-bottom:28px;">
        <tr>
          <td style="padding:16px 20px;font-size:13px;color:${C.inkSoft};line-height:1.6;">
            Aucun remboursement ne sera effectué conformément aux conditions générales.
          </td>
        </tr>
      </table>
      `}

      <p style="font-size:14px;color:${C.inkMuted};">Pour toute question, n'hésitez pas à nous contacter.</p>
      ${cta('Faire une nouvelle réservation', 'http://localhost:5173/reservation')}
    `)
  );

// ─────────────────────────────────────────────────────────
// 4. Confirmation de commande
// ─────────────────────────────────────────────────────────
const sendOrderConfirmation = (user, order) => {
  const itemsRows = (order.items || []).map((item) =>
    row(
      `${esc(item.product_name_snapshot)}${item.variant_label_snapshot ? ` <span style="color:${C.inkMuted};font-size:12px;">— ${esc(item.variant_label_snapshot)}</span>` : ''} <span style="color:${C.inkMuted};font-size:12px;">x${item.quantity}</span>`,
      `${(item.unit_price * item.quantity).toFixed(2)} €`
    )
  ).join('');

  return send(
    user,
    '🛍️ Votre commande est confirmée',
    layout(`
      <div style="display:inline-block;margin-bottom:20px;">
        ${badge('Commande confirmée')}
      </div>
      <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:${C.ink};margin:0 0 8px;">
        Merci pour votre commande !
      </h1>
      <p style="font-size:15px;color:${C.inkMuted};line-height:1.6;margin:0 0 4px;">
        Bonjour ${esc(user.full_name)}, votre commande a bien été reçue.
      </p>
      <p style="font-size:13px;color:${C.inkMuted};margin:0 0 28px;">
        Référence : <strong style="font-family:monospace;color:${C.inkSoft};">#${order.id.slice(0, 8).toUpperCase()}</strong>
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:8px;">
        ${itemsRows}
        ${row('Total payé', `${Number(order.total_price).toFixed(2)} €`, true)}
      </table>

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.cream50};border-radius:12px;margin-top:24px;margin-bottom:8px;">
        <tr>
          <td style="padding:16px 24px;font-size:13px;color:${C.inkSoft};line-height:1.6;">
            📦 Vous serez notifié(e) par email dès l'expédition de votre commande.
          </td>
        </tr>
      </table>

      ${cta('Voir mes commandes', 'http://localhost:5173/compte')}
    `)
  );
};

// ─────────────────────────────────────────────────────────
// 0. Email de vérification (envoyé à l'inscription)
// ─────────────────────────────────────────────────────────
const sendVerificationEmail = (user, token) => {
  const link = `${process.env.CLIENT_URL || 'http://localhost:5173'}/verify-email?token=${token}`;

  return send(
    user,
    '✉️ Vérifiez votre adresse email — FaStyle',
    layout(`
      <h1 style="font-family:Georgia,serif;font-size:26px;font-weight:700;color:${C.ink};margin:0 0 8px;">
        Confirmez votre email
      </h1>
      <p style="font-size:15px;color:${C.inkMuted};line-height:1.6;margin:0 0 28px;">
        Bonjour ${esc(user.full_name)},<br/>
        Merci de votre inscription sur FaStyle. Cliquez sur le bouton ci-dessous pour activer votre compte.
      </p>

      <table width="100%" cellpadding="0" cellspacing="0" style="background-color:${C.cream50};border-radius:12px;margin-bottom:28px;">
        <tr>
          <td style="padding:20px 24px;font-size:13px;color:${C.inkSoft};line-height:1.6;">
            🔒 Ce lien est valable <strong>24 heures</strong>. Si vous n'avez pas créé de compte, ignorez cet email.
          </td>
        </tr>
      </table>

      <div style="text-align:center;">
        ${cta('Vérifier mon email', link)}
      </div>

      <p style="margin-top:24px;font-size:12px;color:${C.inkMuted};text-align:center;">
        Ou copiez ce lien dans votre navigateur :<br/>
        <span style="color:${C.olive};word-break:break-all;">${link}</span>
      </p>
    `)
  );
};

module.exports = {
  sendVerificationEmail,
  sendReservationConfirmation,
  sendReservationCancellation,
  sendOrderConfirmation,
};
