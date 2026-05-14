export type SendEmailInput = {
  to: string;
  subject: string;
  text: string;
  html?: string;
};

/**
 * Sends email via [Resend](https://resend.com) when `RESEND_API_KEY` is set.
 * Otherwise logs to the server console (dev-friendly).
 */
export function sendTransactionalEmail(input: SendEmailInput): void {
  const from = process.env.EMAIL_FROM?.trim() || "onboarding@resend.dev";

  void (async () => {
    const apiKey = process.env.RESEND_API_KEY?.trim();
    if (!apiKey) {
      console.info(
        "[email] RESEND_API_KEY not set — logging message instead of sending.\n",
        `To: ${input.to}\nSubject: ${input.subject}\n\n${input.text}\n`,
      );
      return;
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [input.to],
        subject: input.subject,
        text: input.text,
        html: input.html ?? `<pre style="font-family:sans-serif">${escapeHtml(input.text)}</pre>`,
      }),
    });

    if (!res.ok) {
      const body = await res.text();
      console.error("[email] Resend error", res.status, body);
    }
  })();
}

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
