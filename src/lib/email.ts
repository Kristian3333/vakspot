// src/lib/email.ts
// Email notifications using Resend

import { Resend } from 'resend';

// Lazy initialization to avoid build-time errors when RESEND_API_KEY is not set
let resend: Resend | null = null;
function getResend(): Resend | null {
  if (!process.env.RESEND_API_KEY) return null;
  if (!resend) {
    resend = new Resend(process.env.RESEND_API_KEY);
  }
  return resend;
}

const FROM_EMAIL = 'VakSpot <noreply@vakspot.nl>';
const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

// Helper to send emails (fire-and-forget pattern)
async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  const client = getResend();
  if (!client) {
    console.log('[Email] RESEND_API_KEY not configured, skipping email to:', to);
    return false;
  }

  try {
    await client.emails.send({
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

/**
 * Send welcome email to new client
 */
export async function sendWelcomeEmailClient(params: {
  to: string;
  name: string;
}): Promise<boolean> {
  const { to, name } = params;

  const html = wrapInTemplate(`
    <h2>Welkom bij VakSpot, ${name || 'nieuwe gebruiker'}! 👋</h2>
    <p>Bedankt voor je registratie. Je kunt nu direct een klus plaatsen en vakmannen in je omgeving vinden.</p>

    <h3>Hoe werkt het?</h3>
    <ol style="line-height: 2;">
      <li><strong>Plaats een klus</strong> - Beschrijf wat je nodig hebt</li>
      <li><strong>Ontvang reacties</strong> - Vakmannen in je buurt reageren</li>
      <li><strong>Kies je vakman</strong> - Chat en kies de beste match</li>
    </ol>

    <p>
      <a href="${BASE_URL}/client/jobs/new" class="button">Plaats je eerste klus</a>
    </p>

    <p class="muted">Vragen? Bekijk onze <a href="${BASE_URL}/faq">veelgestelde vragen</a> of neem <a href="${BASE_URL}/contact">contact</a> met ons op.</p>
  `);

  return sendEmail(to, 'Welkom bij VakSpot! 👋', html);
}

/**
 * Send welcome email to new professional
 */
export async function sendWelcomeEmailPro(params: {
  to: string;
  name: string;
  companyName: string;
}): Promise<boolean> {
  const { to, name, companyName } = params;

  const html = wrapInTemplate(`
    <h2>Welkom bij VakSpot, ${companyName}! 🔧</h2>
    <p>Hallo ${name || 'vakman'},</p>
    <p>Bedankt voor je registratie als vakman. Je kunt nu klussen in je omgeving bekijken en klanten bereiken.</p>

    <h3>Aan de slag</h3>
    <ol style="line-height: 2;">
      <li><strong>Maak je profiel compleet</strong> - Voeg een beschrijving en foto toe</li>
      <li><strong>Bekijk klussen</strong> - Vind werk in je vakgebied en regio</li>
      <li><strong>Toon interesse</strong> - Reageer op klussen die je aanspreken</li>
      <li><strong>Chat met klanten</strong> - Bespreek de details en maak afspraken</li>
    </ol>

    <p>
      <a href="${BASE_URL}/pro/jobs" class="button">Bekijk beschikbare klussen</a>
    </p>

    <p style="background: #fef3c7; padding: 15px; border-radius: 4px; margin-top: 20px;">
      <strong>💡 Tip:</strong> Vul je KvK-nummer in voor extra vertrouwen bij klanten.
    </p>

    <p class="muted">Vragen? Bekijk onze <a href="${BASE_URL}/faq">veelgestelde vragen</a> of neem <a href="${BASE_URL}/contact">contact</a> met ons op.</p>
  `);

  return sendEmail(to, `Welkom bij VakSpot, ${companyName}! 🔧`, html);
}

/**
 * Send notification for new jobs in PRO's area (for digest/alerts)
 */
export async function sendNewJobsAlertEmail(params: {
  to: string;
  proName: string;
  jobs: Array<{ title: string; city: string; category: string; id: string }>;
}): Promise<boolean> {
  const { to, proName, jobs } = params;

  const jobsList = jobs
    .slice(0, 5)
    .map(
      (job) => `
      <tr>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb;">
          <strong>${job.title}</strong><br>
          <span class="muted">${job.category} • ${job.city}</span>
        </td>
        <td style="padding: 12px; border-bottom: 1px solid #e5e7eb; text-align: right;">
          <a href="${BASE_URL}/pro/jobs/${job.id}" style="color: #2563eb;">Bekijk →</a>
        </td>
      </tr>
    `
    )
    .join('');

  const html = wrapInTemplate(`
    <h2>Nieuwe klussen in je buurt! 📍</h2>
    <p>Hallo ${proName},</p>
    <p>Er ${jobs.length === 1 ? 'is een nieuwe klus' : `zijn ${jobs.length} nieuwe klussen`} die mogelijk interessant ${jobs.length === 1 ? 'is' : 'zijn'} voor je:</p>

    <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
      ${jobsList}
    </table>

    ${jobs.length > 5 ? `<p class="muted">...en ${jobs.length - 5} andere klussen</p>` : ''}

    <p>
      <a href="${BASE_URL}/pro/jobs" class="button">Bekijk alle klussen</a>
    </p>

    <p class="muted" style="margin-top: 20px; font-size: 12px;">
      Je ontvangt deze email omdat je email notificaties hebt ingeschakeld.
      <a href="${BASE_URL}/settings">Voorkeuren aanpassen</a>
    </p>
  `);

  return sendEmail(to, `${jobs.length} nieuwe ${jobs.length === 1 ? 'klus' : 'klussen'} in je buurt`, html);
}

// ============================================
// PHASE 7: STATUS CHANGE EMAILS
// ============================================

/**
 * Send notification when PRO is selected (ask them to set start date)
 */
export async function sendProSelectedEmail(params: {
  to: string;
  proName: string;
  clientName: string;
  jobTitle: string;
  conversationUrl: string;
}): Promise<boolean> {
  const { to, proName, clientName, jobTitle, conversationUrl } = params;

  const html = wrapInTemplate(`
    <h2>Gefeliciteerd, ${proName}! Je bent gekozen! 🎉</h2>
    <p><strong>${clientName}</strong> heeft jou gekozen voor de klus:</p>
    <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #10b981;">
      <strong>${jobTitle}</strong>
    </p>
    <h3>Volgende stap: Plan de startdatum</h3>
    <p>Bespreek met de klant wanneer je kunt beginnen en stel een startdatum in via het gesprek.</p>
    <p>
      <a href="${BASE_URL}${conversationUrl}" class="button">Ga naar gesprek</a>
    </p>
    <p class="muted">Tip: Reageer snel en stel een concrete startdatum voor om een goede indruk te maken!</p>
  `);

  return sendEmail(to, `Je bent gekozen voor "${jobTitle}" - Stel een startdatum in`, html);
}

/**
 * Send notification when start date is scheduled
 */
export async function sendJobScheduledEmail(params: {
  to: string;
  recipientName: string;
  jobTitle: string;
  startDate: Date;
  conversationUrl: string;
  isClient: boolean;
}): Promise<boolean> {
  const { to, recipientName, jobTitle, startDate, conversationUrl, isClient } = params;

  const formattedDate = startDate.toLocaleDateString('nl-NL', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = wrapInTemplate(`
    <h2>Startdatum bevestigd! 📅</h2>
    <p>Hallo ${recipientName},</p>
    <p>De startdatum voor de volgende klus is ingepland:</p>
    <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">
      <strong>${jobTitle}</strong><br>
      <span style="color: #2563eb; font-size: 18px; margin-top: 10px; display: block;">📅 ${formattedDate}</span>
    </p>
    ${isClient
      ? '<p>De vakman komt op deze datum aan de slag. Zorg dat alles voorbereid is.</p>'
      : '<p>De klant verwacht je op deze datum. Neem contact op als er iets verandert.</p>'
    }
    <p>
      <a href="${BASE_URL}${conversationUrl}" class="button">Bekijk details</a>
    </p>
  `);

  return sendEmail(to, `Startdatum bevestigd: ${formattedDate} - ${jobTitle}`, html);
}

/**
 * Send notification when work starts
 */
export async function sendWorkStartedEmail(params: {
  to: string;
  recipientName: string;
  jobTitle: string;
  conversationUrl: string;
}): Promise<boolean> {
  const { to, recipientName, jobTitle, conversationUrl } = params;

  const html = wrapInTemplate(`
    <h2>Het werk is gestart! 🛠️</h2>
    <p>Hallo ${recipientName},</p>
    <p>Het werk aan de volgende klus is van start gegaan:</p>
    <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #f59e0b;">
      <strong>${jobTitle}</strong>
    </p>
    <p>Houd contact via het gesprek voor updates en vragen.</p>
    <p>
      <a href="${BASE_URL}${conversationUrl}" class="button">Ga naar gesprek</a>
    </p>
  `);

  return sendEmail(to, `Werk gestart: ${jobTitle}`, html);
}

/**
 * Send notification when job is marked as completed
 */
export async function sendJobCompletedEmail(params: {
  to: string;
  recipientName: string;
  jobTitle: string;
  completedBy: 'consumer' | 'pro';
  conversationUrl: string;
  reviewUrl?: string;
}): Promise<boolean> {
  const { to, recipientName, jobTitle, completedBy, conversationUrl, reviewUrl } = params;

  const html = wrapInTemplate(`
    <h2>Klus afgerond! ✅</h2>
    <p>Hallo ${recipientName},</p>
    <p>De volgende klus is gemarkeerd als afgerond ${completedBy === 'consumer' ? 'door de opdrachtgever' : 'door de vakman'}:</p>
    <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #10b981;">
      <strong>${jobTitle}</strong>
    </p>
    ${reviewUrl
      ? `
        <h3>Laat een review achter</h3>
        <p>Deel je ervaring met anderen door een review te schrijven.</p>
        <p>
          <a href="${BASE_URL}${reviewUrl}" class="button">Schrijf een review</a>
        </p>
      `
      : `
        <p>Bedankt voor het gebruik van VakSpot!</p>
        <p>
          <a href="${BASE_URL}${conversationUrl}" class="button">Bekijk details</a>
        </p>
      `
    }
  `);

  return sendEmail(to, `Klus afgerond: ${jobTitle} ✅`, html);
}

/**
 * Send notification when job is cancelled
 */
export async function sendJobCancelledEmail(params: {
  to: string;
  recipientName: string;
  jobTitle: string;
  cancelledBy: 'consumer' | 'pro';
  reason?: string;
}): Promise<boolean> {
  const { to, recipientName, jobTitle, cancelledBy, reason } = params;

  const html = wrapInTemplate(`
    <h2>Klus geannuleerd</h2>
    <p>Hallo ${recipientName},</p>
    <p>Helaas is de volgende klus geannuleerd ${cancelledBy === 'consumer' ? 'door de opdrachtgever' : 'door de vakman'}:</p>
    <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #ef4444;">
      <strong>${jobTitle}</strong>
    </p>
    ${reason
      ? `
        <p class="muted">Reden:</p>
        <p style="background: #fef2f2; padding: 15px; border-radius: 4px; font-style: italic;">
          "${reason}"
        </p>
      `
      : ''
    }
    <p>
      <a href="${BASE_URL}${cancelledBy === 'pro' ? '/client/jobs' : '/pro/jobs'}" class="button">
        ${cancelledBy === 'pro' ? 'Bekijk je klussen' : 'Bekijk nieuwe klussen'}
      </a>
    </p>
  `);

  return sendEmail(to, `Klus geannuleerd: ${jobTitle}`, html);
}

/**
 * Send reminder when PRO hasn't set start date
 */
export async function sendSetStartDateReminderEmail(params: {
  to: string;
  proName: string;
  clientName: string;
  jobTitle: string;
  daysSinceSelection: number;
  conversationUrl: string;
}): Promise<boolean> {
  const { to, proName, clientName, jobTitle, daysSinceSelection, conversationUrl } = params;

  const html = wrapInTemplate(`
    <h2>Herinnering: Stel een startdatum in 📅</h2>
    <p>Hallo ${proName},</p>
    <p>Je bent ${daysSinceSelection} dagen geleden gekozen voor de klus:</p>
    <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #f59e0b;">
      <strong>${jobTitle}</strong><br>
      <span class="muted">Opdrachtgever: ${clientName}</span>
    </p>
    <p><strong>Vergeet niet een startdatum in te stellen!</strong></p>
    <p>De klant wacht op jouw planning. Stel een datum in via het gesprek.</p>
    <p>
      <a href="${BASE_URL}${conversationUrl}" class="button">Stel startdatum in</a>
    </p>
    <p class="muted">Tip: Reageer snel om de klant tevreden te houden.</p>
  `);

  return sendEmail(to, `Herinnering: Stel een startdatum in voor "${jobTitle}"`, html);
}

/**
 * Send notification when quote is received
 */
export async function sendQuoteReceivedEmail(params: {
  to: string;
  clientName: string;
  proName: string;
  proCompany: string;
  jobTitle: string;
  amount: number;
  validUntil: Date;
  conversationUrl: string;
}): Promise<boolean> {
  const { to, clientName, proName, proCompany, jobTitle, amount, validUntil, conversationUrl } = params;

  const formattedAmount = new Intl.NumberFormat('nl-NL', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount / 100);

  const formattedDate = validUntil.toLocaleDateString('nl-NL', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const html = wrapInTemplate(`
    <h2>Nieuwe offerte ontvangen! 📋</h2>
    <p>Hallo ${clientName},</p>
    <p><strong>${proCompany}</strong> (${proName}) heeft een offerte gestuurd voor:</p>
    <p style="background: white; padding: 15px; border-radius: 4px; border-left: 4px solid #2563eb;">
      <strong>${jobTitle}</strong>
    </p>
    <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; text-align: center;">
      <p style="color: #166534; font-size: 28px; font-weight: bold; margin: 0;">${formattedAmount}</p>
      <p class="muted" style="margin: 5px 0 0 0;">Geldig tot ${formattedDate}</p>
    </div>
    <p>Bekijk de volledige offerte en bespreek de details met de vakman.</p>
    <p>
      <a href="${BASE_URL}${conversationUrl}" class="button">Bekijk offerte</a>
    </p>
    <p class="muted">Reageer voor ${formattedDate} om de offerte te accepteren of af te wijzen.</p>
  `);

  return sendEmail(to, `Nieuwe offerte van ${proCompany} voor "${jobTitle}"`, html);
}
