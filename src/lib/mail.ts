import "server-only";
import nodemailer from "nodemailer";

/**
 * Email via SMTP (Gmail by default). All config comes from the environment; if
 * SMTP isn't configured the app still works — sending is simply skipped and the
 * caller is told, so account creation never fails just because mail is down.
 */

function getTransport() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;
  if (!SMTP_HOST || !SMTP_USER || !SMTP_PASS) return null;

  const port = Number(SMTP_PORT) || 465;
  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465, // 465 = implicit TLS; 587 = STARTTLS
    auth: { user: SMTP_USER, pass: SMTP_PASS },
  });
}

export function isMailConfigured() {
  return Boolean(process.env.SMTP_HOST && process.env.SMTP_USER && process.env.SMTP_PASS);
}

type SendResult = { sent: boolean; skipped?: boolean; error?: string };

async function send(to: string, subject: string, html: string, text: string): Promise<SendResult> {
  const transport = getTransport();
  if (!transport) return { sent: false, skipped: true };

  try {
    await transport.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to,
      subject,
      text,
      html,
    });
    return { sent: true };
  } catch (error: any) {
    console.error("sendMail error:", error?.message ?? error);
    return { sent: false, error: error?.message ?? "Failed to send email." };
  }
}

const shell = (heading: string, body: string) => `
  <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;padding:24px;color:#0B012C">
    <div style="font-size:20px;font-weight:800;margin-bottom:4px">🧊 Iceberg</div>
    <h1 style="font-size:18px;font-weight:800;margin:16px 0 8px">${heading}</h1>
    ${body}
    <hr style="border:none;border-top:1px solid #E2D5F8;margin:24px 0" />
    <p style="font-size:11px;color:#645A95">You're receiving this because an administrator created or updated your Iceberg account.</p>
  </div>
`;

const credBox = (email: string, password: string) => `
  <table style="width:100%;background:#F5EFFF;border:1px solid #E2D5F8;border-radius:12px;padding:16px;margin:12px 0;border-collapse:separate">
    <tr><td style="font-size:11px;color:#645A95;font-weight:700;padding-bottom:4px">EMAIL</td></tr>
    <tr><td style="font-family:monospace;font-size:14px;padding-bottom:12px">${email}</td></tr>
    <tr><td style="font-size:11px;color:#645A95;font-weight:700;padding-bottom:4px">TEMPORARY PASSWORD</td></tr>
    <tr><td style="font-family:monospace;font-size:14px">${password}</td></tr>
  </table>
`;

/** Sent to a new student with their sign-in details. */
export function sendWelcomeEmail(opts: {
  to: string;
  name: string;
  password: string;
  loginUrl: string;
}) {
  const html = shell(
    `Welcome, ${opts.name}`,
    `<p style="font-size:14px;line-height:1.6">An Iceberg account has been created for you. Sign in with the details below and change your password once you're in.</p>
     ${credBox(opts.to, opts.password)}
     <a href="${opts.loginUrl}" style="display:inline-block;background:#2563EB;color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:10px 20px;border-radius:999px;margin-top:8px">Sign in</a>`
  );
  const text = `Welcome to Iceberg, ${opts.name}.\n\nEmail: ${opts.to}\nTemporary password: ${opts.password}\n\nSign in: ${opts.loginUrl}\n\nPlease change your password after signing in.`;
  return send(opts.to, "Your Iceberg account", html, text);
}

/** Sent when an admin resets a user's password. */
export function sendPasswordResetEmail(opts: {
  to: string;
  name: string;
  password: string;
  loginUrl: string;
}) {
  const html = shell(
    `Your password was reset`,
    `<p style="font-size:14px;line-height:1.6">An administrator reset the password on your Iceberg account. Your previous password no longer works.</p>
     ${credBox(opts.to, opts.password)}
     <a href="${opts.loginUrl}" style="display:inline-block;background:#2563EB;color:#fff;text-decoration:none;font-weight:700;font-size:13px;padding:10px 20px;border-radius:999px;margin-top:8px">Sign in</a>`
  );
  const text = `Your Iceberg password was reset.\n\nEmail: ${opts.to}\nNew temporary password: ${opts.password}\n\nSign in: ${opts.loginUrl}\n\nPlease change it after signing in.`;
  return send(opts.to, "Your Iceberg password was reset", html, text);
}
