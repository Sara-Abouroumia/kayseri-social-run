import type { TransactionalEmailCopy } from "@/i18n/messages/transactional-email";

const BRAND_RED = "#d91f06";
const BRAND_RED_DARK = "#b8160a";

export function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function logoUrl(siteUrl: string): string {
  return `${siteUrl.replace(/\/+$/, "")}/kayserisocialrun_logo.png`;
}

function wrapEmailDocument(params: {
  siteUrl: string;
  copy: TransactionalEmailCopy;
  preheader: string;
  bodyHtml: string;
}): string {
  const { siteUrl, copy, preheader, bodyHtml } = params;
  const logo = logoUrl(siteUrl);

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <meta name="color-scheme" content="light" />
  <title>${escapeHtml(copy.brandName)}</title>
</head>
<body style="margin:0;padding:0;background-color:#f4f4f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f5;padding:32px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:560px;background-color:#ffffff;border-radius:12px;border:1px solid #e4e4e7;overflow:hidden;">
          <tr>
            <td style="padding:28px 32px 20px;text-align:center;background:linear-gradient(180deg,#fff5f4 0%,#ffffff 100%);border-bottom:1px solid #f4f4f5;">
              <a href="${escapeHtml(siteUrl)}" style="text-decoration:none;">
                <img src="${escapeHtml(logo)}" alt="${escapeHtml(copy.brandName)}" width="112" height="112" style="display:block;margin:0 auto 12px;border:0;outline:none;" />
              </a>
              <p style="margin:0;font-size:13px;font-weight:600;letter-spacing:0.06em;text-transform:uppercase;color:${BRAND_RED_DARK};">${escapeHtml(copy.brandName)}</p>
            </td>
          </tr>
          <tr>
            <td style="padding:32px 32px 28px;color:#18181b;font-size:15px;line-height:1.6;">
              ${bodyHtml}
            </td>
          </tr>
          <tr>
            <td style="padding:20px 32px 28px;background-color:#fafafa;border-top:1px solid #f4f4f5;color:#71717a;font-size:12px;line-height:1.5;">
              <p style="margin:0 0 8px;">${escapeHtml(copy.footerTagline)}</p>
              <p style="margin:0 0 12px;"><a href="${escapeHtml(siteUrl)}" style="color:${BRAND_RED};text-decoration:underline;">${escapeHtml(copy.visitSite)}</a></p>
              <p style="margin:0;">${escapeHtml(copy.footerIgnore)}</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function ctaButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:28px 0 20px;">
  <tr>
    <td align="center" style="border-radius:8px;background-color:${BRAND_RED};">
      <a href="${escapeHtml(href)}" style="display:inline-block;padding:14px 28px;font-size:15px;font-weight:600;color:#ffffff;text-decoration:none;border-radius:8px;">${escapeHtml(label)}</a>
    </td>
  </tr>
</table>`;
}

function plainLinkBlock(url: string, hint: string): string {
  return `<p style="margin:20px 0 0;font-size:13px;color:#52525b;">${escapeHtml(hint)}</p>
<p style="margin:8px 0 0;font-size:13px;word-break:break-all;"><a href="${escapeHtml(url)}" style="color:${BRAND_RED};">${escapeHtml(url)}</a></p>`;
}

function greetingLine(copy: TransactionalEmailCopy, name?: string | null): string {
  const trimmed = name?.trim();
  const line = trimmed
    ? copy.verifyGreetingNamed.replace("{name}", trimmed)
    : copy.verifyGreetingGeneric;
  return `<p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#18181b;">${escapeHtml(line)}</p>`;
}

export function buildVerificationEmail(params: {
  copy: TransactionalEmailCopy;
  siteUrl: string;
  verifyUrl: string;
  recipientName?: string | null;
}): { subject: string; text: string; html: string } {
  const { copy, siteUrl, verifyUrl, recipientName } = params;
  const greeting = recipientName?.trim()
    ? copy.verifyGreetingNamed.replace("{name}", recipientName.trim())
    : copy.verifyGreetingGeneric;

  const text = `${greeting}

${copy.verifyIntro}

${copy.verifyCta}: ${verifyUrl}

${copy.verifyExpiry}

${copy.verifyIgnore}

— ${copy.brandName}
${siteUrl}
`;

  const bodyHtml = `
${greetingLine(copy, recipientName)}
<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;line-height:1.3;color:#18181b;">${escapeHtml(copy.verifyHeading)}</h1>
<p style="margin:0 0 12px;">${escapeHtml(copy.verifyIntro)}</p>
${ctaButton(verifyUrl, copy.verifyCta)}
${plainLinkBlock(verifyUrl, copy.verifyLinkHint)}
<p style="margin:24px 0 0;font-size:13px;color:#71717a;">${escapeHtml(copy.verifyExpiry)}</p>
<p style="margin:12px 0 0;font-size:13px;color:#71717a;">${escapeHtml(copy.verifyIgnore)}</p>`;

  return {
    subject: copy.verifySubject,
    text,
    html: wrapEmailDocument({
      siteUrl,
      copy,
      preheader: copy.verifyIntro,
      bodyHtml,
    }),
  };
}

export function buildAdminInviteEmail(params: {
  copy: TransactionalEmailCopy;
  siteUrl: string;
  registerUrl: string;
  inviteEmail: string;
}): { subject: string; text: string; html: string } {
  const { copy, siteUrl, registerUrl, inviteEmail } = params;

  const text = `${copy.inviteGreeting}

${copy.inviteIntro}

${copy.inviteEmailLabel} ${inviteEmail}

${copy.inviteCta}: ${registerUrl}

${copy.inviteStepsHeading}:
1. ${copy.inviteStep1}
2. ${copy.inviteStep2}
3. ${copy.inviteStep3}

${copy.inviteExpiry}

${copy.inviteIgnore}

— ${copy.brandName}
${siteUrl}
`;

  const bodyHtml = `
<p style="margin:0 0 16px;font-size:16px;font-weight:600;color:#18181b;">${escapeHtml(copy.inviteGreeting)}</p>
<h1 style="margin:0 0 16px;font-size:22px;font-weight:700;line-height:1.3;color:#18181b;">${escapeHtml(copy.inviteHeading)}</h1>
<p style="margin:0 0 16px;">${escapeHtml(copy.inviteIntro)}</p>
<p style="margin:0 0 8px;font-size:14px;color:#52525b;">${escapeHtml(copy.inviteEmailLabel)}</p>
<p style="margin:0 0 20px;font-size:16px;font-weight:600;color:#18181b;">${escapeHtml(inviteEmail)}</p>
${ctaButton(registerUrl, copy.inviteCta)}
${plainLinkBlock(registerUrl, copy.inviteLinkHint)}
<p style="margin:24px 0 8px;font-size:14px;font-weight:600;color:#18181b;">${escapeHtml(copy.inviteStepsHeading)}</p>
<ol style="margin:0;padding-left:20px;color:#3f3f46;font-size:14px;line-height:1.6;">
  <li style="margin-bottom:8px;">${escapeHtml(copy.inviteStep1)}</li>
  <li style="margin-bottom:8px;">${escapeHtml(copy.inviteStep2)}</li>
  <li>${escapeHtml(copy.inviteStep3)}</li>
</ol>
<p style="margin:20px 0 0;font-size:13px;color:#71717a;">${escapeHtml(copy.inviteExpiry)}</p>
<p style="margin:12px 0 0;font-size:13px;color:#71717a;">${escapeHtml(copy.inviteIgnore)}</p>`;

  return {
    subject: copy.inviteSubject,
    text,
    html: wrapEmailDocument({
      siteUrl,
      copy,
      preheader: copy.inviteIntro,
      bodyHtml,
    }),
  };
}
