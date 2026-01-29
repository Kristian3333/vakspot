// src/lib/email.ts
// Email notifications using Resend

import { Resend } from 'resend';

const resend = new Resend(process.env.RESEND_API_KEY);

const FROM_EMAIL = 'VakSpot <noreply@vakspot.nl>';
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Helper to send emails (fire-and-forget pattern)
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  if (!process.env.RESEND_API_KEY) {
    console.log('[Email] RESEND_API_KEY not configured, skipping email to:', to);
    return false;
  }

  try {
    await resend.emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
    });
    console.log('[Email] Sent successfully to:', to);
    return true;
  } catch (error) {
    console.error('[Email] Failed to send to:', to, error);
    return false;
  }
}

// Email template wrapper
function wrapInTemplate(content: string): string {
  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 0; }
        .container { max-width: 600px; margin: 0 auto; padding: 20px; }
        .header { background: #2563eb; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0; }
        .header h1 { margin: 0; font-size: 24px; }
        .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
        .button { display: inline-block; background: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; margin: 20px 0; }
        .button:hover { background: #1d4ed8; }
        .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
        .muted { color: #6b7280; font-size: 14px; }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h1>VakSpot</h1>
        </div>
        <div class="content">
          ${content}
        </div>
        <div class="footer">
          <p>Dit is een automatisch bericht van VakSpot.</p>
          <p class="muted">Je ontvangt deze email omdat je een account hebt op VakSpot.</p>
        </div>
      </div>
    </body>
    </html>
  `;
}

// ============================================
// EMAIL NOTIFICATION FUNCTIONS
// ============================================

/**
 * Send notification when a new message is received
 */
export async function sendNewMessageEmail(params: {
  to: string;
  senderName: string;
  jobTitle: string;
  messagePreview: string;
  conversationUrl: string;
}): Promise<boolean> {
  const { to, senderName, jobTitle, messagePreview, conversationUrl } = params;

  const html = wrapInTemplate(`
    <h2>Nieuw bericht ontvangen</h2>
    <p><strong>${senderName}</strong> heeft je een bericht gestuurd over:</p>
    <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">
      <strong>${jobTitle}</strong>
    </p>
    <p class="muted">Bericht preview:</p>
    <p style="background: white; padding: 15px; border-radius: 4px; font-style: italic;">
      "${messagePreview}${messagePreview.length >= 100 ? '...' : ''}"
    </p>
    <p>
      <a href="${BASE_URL}${conversationUrl}" class="button">Bekijk bericht</a>
    </p>
  `);

  return sendEmail(to, `Nieuw bericht van ${senderName} - ${jobTitle}`, html);
}

/**
 * Send notification when a PRO shows interest in a job (to Client)
 */
export async function sendNewInterestEmail(params: {
  to: string;
  proName: string;
  proCompany: string;
  jobTitle: string;
  message: string;
  jobUrl: string;
}): Promise<boolean> {
  const { to, proName, proCompany, jobTitle, message, jobUrl } = params;

  const html = wrapInTemplate(`
    <h2>Nieuwe interesse in je klus!</h2>
    <p>Goed nieuws! <strong>${proCompany}</strong> (${proName}) is geïnteresseerd in je klus:</p>
    <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #10b981;">
      <strong>${jobTitle}</strong>
    </p>
    <p class="muted">Hun bericht:</p>
    <p style="background: white; padding: 15px; border-radius: 4px; font-style: italic;">
      "${message.substring(0, 200)}${message.length > 200 ? '...' : ''}"
    </p>
    <p>
      <a href="${BASE_URL}${jobUrl}" class="button">Bekijk interesse</a>
    </p>
    <p class="muted">Je kunt direct met de vakman chatten om details te bespreken.</p>
  `);

  return sendEmail(to, `${proCompany} is geïnteresseerd in "${jobTitle}"`, html);
}

/**
 * Send notification when a bid is accepted (to PRO)
 */
export async function sendBidAcceptedEmail(params: {
  to: string;
  clientName: string;
  jobTitle: string;
  conversationUrl: string;
}): Promise<boolean> {
  const { to, clientName, jobTitle, conversationUrl } = params;

  const html = wrapInTemplate(`
    <h2>Gefeliciteerd! Je bent gekozen! 🎉</h2>
    <p><strong>${clientName}</strong> heeft jou gekozen voor de klus:</p>
    <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #10b981;">
      <strong>${jobTitle}</strong>
    </p>
    <p>Je kunt nu verder chatten met de klant om de details en planning te bespreken.</p>
    <p>
      <a href="${BASE_URL}${conversationUrl}" class="button">Ga naar gesprek</a>
    </p>
    <p class="muted">Tip: Reageer snel om een goede indruk te maken!</p>
  `);

  return sendEmail(to, `Je bent gekozen voor "${jobTitle}"! 🎉`, html);
}

/**
 * Send notification when a bid is rejected (to PRO)
 */
export async function sendBidRejectedEmail(params: {
  to: string;
  jobTitle: string;
}): Promise<boolean> {
  const { to, jobTitle } = params;

  const html = wrapInTemplate(`
    <h2>Update over je interesse</h2>
    <p>Helaas heeft de klant een andere vakman gekozen voor de klus:</p>
    <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #f59e0b;">
      <strong>${jobTitle}</strong>
    </p>
    <p>Geen zorgen - er zijn altijd nieuwe kansen! Bekijk de nieuwste klussen in jouw omgeving.</p>
    <p>
      <a href="${BASE_URL}/pro/jobs" class="button">Bekijk nieuwe klussen</a>
    </p>
    <p class="muted">Tip: Reageer snel op nieuwe klussen om je kansen te vergroten.</p>
  `);

  return sendEmail(to, `Update: Andere vakman gekozen voor "${jobTitle}"`, html);
}
