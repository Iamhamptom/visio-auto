import { Resend } from "resend";

const FROM_DEFAULT = "Visio Auto <auto@visiocorp.co>";
const REPLY_TO_DEFAULT = "david@visiocorp.co";

function getClient() {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) return null;
  return new Resend(apiKey);
}

export interface EmailSend {
  to: string | string[];
  subject: string;
  html: string;
  from?: string;
  replyTo?: string;
  text?: string;
}

export interface EmailResult {
  sent: boolean;
  id?: string;
  error?: string;
  skipped_reason?: "no_api_key" | "auto_send_disabled";
}

/**
 * Send an email via Resend. Returns a structured result — never throws.
 * Honors the AUTO_SEND_ENABLED env flag when the caller passes autoSend=true.
 */
export async function sendEmail(
  payload: EmailSend,
  opts: { autoSend?: boolean } = {}
): Promise<EmailResult> {
  const client = getClient();
  if (!client) {
    return { sent: false, skipped_reason: "no_api_key", error: "RESEND_API_KEY not set" };
  }

  if (opts.autoSend && process.env.AUTO_SEND_ENABLED !== "true") {
    return { sent: false, skipped_reason: "auto_send_disabled" };
  }

  try {
    const result = await client.emails.send({
      from: payload.from ?? FROM_DEFAULT,
      to: payload.to,
      reply_to: payload.replyTo ?? REPLY_TO_DEFAULT,
      subject: payload.subject,
      html: payload.html,
      text: payload.text,
    } as Parameters<typeof client.emails.send>[0]);

    if (result.error) {
      return { sent: false, error: result.error.message };
    }
    return { sent: true, id: result.data?.id };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    return { sent: false, error: msg };
  }
}
