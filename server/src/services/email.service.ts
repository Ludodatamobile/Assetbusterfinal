import nodemailer from "nodemailer";
import { env } from "../config/env.js";
import path from "path";
import { fileURLToPath } from "url";

interface EmailOptions {
  to: string;
  subject: string;
  html: string;
  text?: string;
}


const __dirname = path.dirname(fileURLToPath(import.meta.url));
const LOGO_PATH = path.resolve(__dirname, "../assets/ab.png");
const LOGO_CID  = "logo-ab@assetbusters";

const hasSmtpConfig = Boolean(env.SMTP_HOST && env.SMTP_USER && env.SMTP_PASS);

const transporter = hasSmtpConfig
  ? nodemailer.createTransport({
      host: env.SMTP_HOST,
      port: Number(env.SMTP_PORT) || 587,
      secure: Number(env.SMTP_PORT) === 465,
      auth: {
        user: env.SMTP_USER,
        pass: env.SMTP_PASS.replace(/\s/g, ""),
      },
      connectionTimeout: 8000,
      greetingTimeout: 8000,
      socketTimeout: 10000,
      pool: true,
      maxConnections: 3,
      maxMessages: 100,
    })
  : null;

if (transporter) {
  transporter
    .verify()
    .then(() => { console.log("SMTP configuration verified"); })
    .catch((error) => { console.error("SMTP configuration error:", error); });
} else {
  console.warn("SMTP not configured. Emails will be skipped.");
}

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatRole(role: string) {
  return role
    .split("_")
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1).toLowerCase())
    .join(" ");
}

const T = {
  navy:    "#0a1628",
  navy2:   "#0d1e35",
  navyMid: "#112240",
  blue:    "#1A56DB",
  blueD:   "#1444B8",
  blueL:   "#3b82f6",
  amber:   "#F5A623",
  amberD:  "#c97d10",
  green:   "#10B981",
  greenD:  "#059669",
  purple:  "#7C3AED",
  red:     "#D42B2B",
  text:    "#0f1e36",
  t2:      "#4a5568",
  t3:      "#8896a8",
  t4:      "#a8b5c4",
  bdr:     "#e2e6ed",
  bdrD:    "#d0d8e4",
  surf:    "#f4f6f9",
  surfD:   "#edf0f5",
  bg:      "#ffffff",
  font:    "'Helvetica Neue', Helvetica, Arial, sans-serif",
  mono:    "'Courier New', Courier, monospace",
};

function emailLayout(slots: { preheader?: string; header: string; body: string; footer?: string }): string {
  const preheader = slots.preheader
    ? `<div style="display:none;max-height:0;overflow:hidden;mso-hide:all;font-size:1px;color:${T.surf};">${slots.preheader}&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;&nbsp;&#847;&zwnj;</div>`
    : "";

  return `<!DOCTYPE html>
<html lang="en" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8"/>
  <meta name="viewport" content="width=device-width,initial-scale=1"/>
  <meta http-equiv="X-UA-Compatible" content="IE=edge"/>
  <meta name="format-detection" content="telephone=no,date=no,address=no,email=no"/>
  <meta name="x-apple-disable-message-reformatting"/>
  <title>Asset Busters</title>
  <!--[if mso]>
  <noscript><xml><o:OfficeDocumentSettings><o:PixelsPerInch>96</o:PixelsPerInch></o:OfficeDocumentSettings></xml></noscript>
  <![endif]-->
  <style>
    @media only screen and (max-width:600px){
      .col-full{width:100%!important;display:block!important;}
      .px-mobile{padding-left:20px!important;padding-right:20px!important;}
      .hide-mobile{display:none!important;max-height:0!important;overflow:hidden!important;}
      .font-hero{font-size:24px!important;line-height:1.2!important;}
    }
  </style>
</head>
<body style="margin:0;padding:0;background-color:${T.surf};font-family:${T.font};-webkit-font-smoothing:antialiased;mso-line-height-rule:exactly;">
${preheader}

<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${T.surf};">
  <tr>
    <td align="center" style="padding:40px 16px 56px;">
      <table role="presentation" width="600" cellpadding="0" cellspacing="0" border="0" style="max-width:600px;width:100%;">

        <!-- ══ HEADER ══ -->
        ${slots.header}

        <!-- ══ BODY ══ -->
        <tr>
          <td style="background-color:${T.bg};border:1px solid ${T.bdr};border-top:none;">
            <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
              <tr>
                <td class="px-mobile" style="padding:40px 44px;">
                  ${slots.body}
                </td>
              </tr>
            </table>
          </td>
        </tr>

        <!-- ══ FOOTER ══ -->
        <tr>
          <td style="padding:32px 0 0;">
            ${slots.footer ?? defaultFooter()}
          </td>
        </tr>

      </table>
    </td>
  </tr>
</table>
</body>
</html>`;
}

function defaultFooter(): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="border-top:1px solid ${T.bdr};padding-top:28px;text-align:center;">
      <!-- Wordmark -->
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center" style="margin:0 auto 16px;">
        <tr>
          <td style="width:24px;height:24px;background-color:${T.blue};border-radius:3px;text-align:center;vertical-align:middle;">
            <span style="font-size:13px;line-height:24px;display:block;">⚡</span>
          </td>
          <td style="padding-left:8px;vertical-align:middle;">
            <span style="font-family:${T.font};font-size:13px;font-weight:700;color:${T.t2};letter-spacing:-0.2px;">Asset Busters</span>
          </td>
        </tr>
      </table>
      <p style="margin:0 0 8px;font-family:${T.font};font-size:11px;color:${T.t3};line-height:1.6;">
        © 2025 Asset Busters. All rights reserved.<br/>
        15 Awolowo Road, Ikoyi, Lagos, Nigeria
      </p>
      <p style="margin:0;font-family:${T.font};font-size:11px;color:${T.t3};">
        <a href="mailto:support@assetbusters.com" style="color:${T.blue};text-decoration:none;font-weight:600;">support@assetbusters.com</a>
        <span style="color:${T.bdrD};">&nbsp;·&nbsp;</span>
        <a href="#" style="color:${T.t4};text-decoration:none;">Unsubscribe</a>
        <span style="color:${T.bdrD};">&nbsp;·&nbsp;</span>
        <a href="#" style="color:${T.t4};text-decoration:none;">Privacy Policy</a>
      </p>
    </td>
  </tr>
</table>`;
}

function navyHeader(opts: {
  eyebrow: string;
  title: string;
  subtitle?: string;
  accentColor?: string;
}): string {
  const accent = opts.accentColor ?? T.blue;

  return `
<tr>
  <td style="background-color:${T.navy2};border-radius:0;">
    <!-- Top rule: 3-color accent bar -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td style="height:3px;background:linear-gradient(90deg,${T.blue} 0%,${accent} 50%,${T.green} 100%);font-size:0;line-height:0;">&nbsp;</td>
      </tr>
    </table>

    <!-- Logo bar -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td class="px-mobile" style="padding:24px 44px 0;">
          <table role="presentation" cellpadding="0" cellspacing="0" border="0">
            <tr>
              <td style="width:32px;height:32px;background-color:${T.blue};border-radius:3px;text-align:center;vertical-align:middle;">
                <span style="font-size:16px;line-height:32px;display:block;">⚡</span>
              </td>
              <td style="padding-left:10px;vertical-align:middle;">
                <span style="font-family:${T.font};font-size:15px;font-weight:700;color:#ffffff;letter-spacing:-0.3px;">Asset Busters</span>
                <span style="display:block;font-family:${T.font};font-size:9px;font-weight:600;color:rgba(255,255,255,0.35);letter-spacing:1.6px;text-transform:uppercase;margin-top:1px;">Pan-African M&amp;A Marketplace</span>
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>

    <!-- Hero content -->
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td class="px-mobile" style="padding:32px 44px 36px;">
          <!-- Eyebrow tag -->
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:18px;">
            <tr>
              <td style="background-color:rgba(255,255,255,0.07);border:1px solid rgba(255,255,255,0.12);padding:5px 12px;">
                <span style="font-family:${T.font};font-size:9px;font-weight:700;color:rgba(255,255,255,0.55);letter-spacing:1.8px;text-transform:uppercase;">${opts.eyebrow}</span>
              </td>
            </tr>
          </table>

          <!-- Title -->
          <h1 class="font-hero" style="margin:0 0 ${opts.subtitle ? "12px" : "0"};font-family:${T.font};font-size:30px;font-weight:800;color:#ffffff;letter-spacing:-0.8px;line-height:1.15;">${opts.title}</h1>

          ${opts.subtitle
            ? `<p style="margin:0;font-family:${T.font};font-size:13px;color:rgba(255,255,255,0.48);line-height:1.7;">${opts.subtitle}</p>`
            : ""}
        </td>
      </tr>
    </table>
  </td>
</tr>`;
}

// Body primitives

function greeting(name: string, emoji = ""): string {
  return `<p style="margin:0 0 8px;font-family:${T.font};font-size:20px;font-weight:800;color:${T.text};letter-spacing:-0.4px;">Hi ${name}${emoji ? ` ${emoji}` : ""},</p>`;
}

function para(content: string, opts: { mb?: string } = {}): string {
  return `<p style="margin:0 0 ${opts.mb ?? "20px"};font-family:${T.font};font-size:13px;color:${T.t2};line-height:1.8;">${content}</p>`;
}

function hr(mt = "28px", mb = "28px"): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:${mt} 0 ${mb};"><tr><td style="height:1px;background-color:${T.bdr};font-size:0;">&nbsp;</td></tr></table>`;
}

function ctaBlock(label: string, href: string, caption?: string, color = T.blue): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:28px 0;">
  <tr>
    <td style="background-color:${T.navy};border:1px solid rgba(255,255,255,0.05);padding:30px 28px;text-align:center;">
      ${caption
        ? `<p style="margin:0 0 18px;font-family:${T.font};font-size:12.5px;color:rgba(255,255,255,0.48);line-height:1.7;">${caption}</p>`
        : ""}
      <table role="presentation" cellpadding="0" cellspacing="0" border="0" align="center">
        <tr>
          <td style="background-color:${color};border-radius:2px;">
            <a href="${href}" style="display:inline-block;padding:14px 36px;font-family:${T.font};font-size:13px;font-weight:700;color:#ffffff;text-decoration:none;letter-spacing:0.1px;">${label}</a>
          </td>
        </tr>
      </table>
    </td>
  </tr>
</table>`;
}

function ctaButton(label: string, href: string, color = T.blue): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0">
  <tr>
    <td style="background-color:${color};border-radius:2px;">
      <a href="${href}" style="display:inline-block;padding:12px 28px;font-family:${T.font};font-size:12.5px;font-weight:700;color:#ffffff;text-decoration:none;">${label} &rarr;</a>
    </td>
  </tr>
</table>`;
}

function linkBox(url: string): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:12px 0 20px;">
  <tr>
    <td style="background-color:${T.surf};border:1px solid ${T.bdr};border-left:3px solid ${T.blue};padding:13px 16px;">
      <span style="font-family:${T.mono};font-size:11px;color:${T.t2};word-break:break-all;line-height:1.6;">${url}</span>
    </td>
  </tr>
</table>`;
}

function alertBox(html: string, type: "info" | "warning" | "success" | "danger" = "info"): string {
  const map = {
    info:    { border: T.blue,   bg: "#eff6ff", color: T.t2 },
    warning: { border: T.amber,  bg: "#fffbeb", color: "#92400e" },
    success: { border: T.green,  bg: "#f0fdf4", color: "#166534" },
    danger:  { border: T.red,    bg: "#fef2f2", color: "#991b1b" },
  };
  const s = map[type];
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
  <tr>
    <td style="background-color:${s.bg};border:1px solid ${s.border}28;border-left:3px solid ${s.border};padding:14px 18px;">
      <p style="margin:0;font-family:${T.font};font-size:12px;color:${s.color};line-height:1.75;">${html}</p>
    </td>
  </tr>
</table>`;
}

/** Numbered step row */
function stepRow(num: string, title: string, body: string, color = T.blue): string {
  return `
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:10px;">
  <tr>
    <td width="44" valign="top" style="padding-right:14px;padding-top:2px;">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="width:28px;height:28px;background-color:${color};border-radius:50%;text-align:center;vertical-align:middle;">
            <span style="font-family:${T.font};font-size:12px;font-weight:800;color:#ffffff;line-height:28px;display:block;">${num}</span>
          </td>
        </tr>
      </table>
    </td>
    <td valign="top" style="background-color:${T.surf};border:1px solid ${T.bdr};border-left:2px solid ${color};padding:13px 16px;">
      <p style="margin:0 0 4px;font-family:${T.font};font-size:12.5px;font-weight:700;color:${T.text};">${title}</p>
      <p style="margin:0;font-family:${T.font};font-size:12px;color:${T.t2};line-height:1.65;">${body}</p>
    </td>
  </tr>
</table>`;
}

/** Section label (eyebrow) */
function sectionLabel(text: string): string {
  return `<p style="margin:0 0 12px;font-family:${T.font};font-size:9.5px;font-weight:700;color:${T.t3};text-transform:uppercase;letter-spacing:1.2px;">${text}</p>`;
}

/** Stat pill row */
function statRow(stats: Array<{ label: string; value: string }>): string {
  const cells = stats.map((s, i) => `
    <td style="padding:${i > 0 ? "0 0 0 10px" : "0"};">
      <table role="presentation" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="background-color:${T.surf};border:1px solid ${T.bdr};padding:11px 16px;white-space:nowrap;">
            <span style="display:block;font-family:${T.font};font-size:9px;font-weight:700;color:${T.t3};text-transform:uppercase;letter-spacing:0.9px;margin-bottom:4px;">${s.label}</span>
            <span style="font-family:${T.font};font-size:14px;font-weight:800;color:${T.text};letter-spacing:-0.3px;">${s.value}</span>
          </td>
        </tr>
      </table>
    </td>`).join("");

  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:28px;">
  <tr>${cells}</tr>
</table>`;
}

/** Role badge pill */
function roleBadge(icon: string, label: string, color: string): string {
  return `
<table role="presentation" cellpadding="0" cellspacing="0" border="0" style="margin-bottom:20px;">
  <tr>
    <td style="background-color:${color}14;border:1px solid ${color}28;border-left:3px solid ${color};padding:9px 16px;">
      <span style="font-family:${T.font};font-size:11.5px;font-weight:700;color:${color};">${icon}&nbsp;&nbsp;${label}</span>
    </td>
  </tr>
</table>`;
}

// Email service class 
export class EmailService {
  static async sendEmail(options: EmailOptions) {
    if (!transporter) {
      console.warn("SMTP not configured. Skipping email:", {
        to: options.to,
        subject: options.subject,
      });
      return null;
    }

    try {
      const info = await transporter.sendMail({
        from: `"Asset Busters" <${env.SMTP_USER}>`,
        to: options.to,
        subject: options.subject,
        html: options.html,
        text: options.text,
      });

      console.log("Email sent:", {
        messageId: info.messageId,
        to: options.to,
        subject: options.subject,
      });

      return info;
    } catch (error) {
      console.error("Email send error:", {
        to: options.to,
        subject: options.subject,
        error,
      });
      throw error;
    }
  }

  // Verification email
  static async sendVerificationEmail(
    email: string,
    token: string,
    firstName: string,
  ) {
    const safeName = escapeHtml(firstName);
    const verificationUrl = `${env.CLIENT_URL}/verify-email?token=${encodeURIComponent(token)}`;

    const header = navyHeader({
      eyebrow: "Account Activation",
      title: "Confirm your\nemail address",
      subtitle: "One step to activate your workspace.",
      accentColor: T.blue,
    });

    const body = `
      ${greeting(safeName, "👋")}
      ${para(`You're almost there. Confirm your email address to activate your Asset Busters account and begin connecting with verified buyers, sellers, and investors across Africa.`)}

      ${ctaBlock("Verify My Email Address", verificationUrl, "This link expires in <strong style='color:#ffffff;'>24 hours.</strong>", T.blue)}

      ${hr("4px", "24px")}
      ${sectionLabel("What happens next")}
      ${stepRow("1", "Confirm your email", "Click the button above to verify your identity and activate your account.", T.blue)}
      ${stepRow("2", "Complete your mandate profile", "Add your details and deal mandate so we can surface the right opportunities.", T.green)}
      ${stepRow("3", "Start transacting", "Browse listings, connect with counterparties, and move deals through your pipeline.", T.amber)}

      ${hr()}

      <p style="margin:0 0 8px;font-family:${T.font};font-size:12px;color:${T.t3};">Button not working? Copy and paste this link into your browser:</p>
      ${linkBox(verificationUrl)}

      ${alertBox("If you did not create an Asset Busters account, you can safely disregard this email. No action is required.", "warning")}`;

    const html = emailLayout({
      preheader: `Verify your email to activate your Asset Busters account — link expires in 24 hours.`,
      header,
      body,
    });

    return this.sendEmail({
      to: email,
      subject: "Verify Your Email — Asset Busters",
      html,
      text: `Hi ${firstName},\n\nVerify your Asset Busters account by opening this link:\n\n${verificationUrl}\n\nThis link expires in 24 hours. If you did not create this account, ignore this email.`,
    });
  }

  // Password reset email
  static async sendPasswordResetEmail(
    email: string,
    token: string,
    firstName: string,
  ) {
    const safeName = escapeHtml(firstName);
    const resetUrl = `${env.CLIENT_URL}/reset-password?token=${encodeURIComponent(token)}`;

    const header = navyHeader({
      eyebrow: "Security Alert",
      title: "Password reset\nrequest",
      subtitle: "Initiated for your account. Valid for 1 hour.",
      accentColor: T.red,
    });

    const body = `
      ${greeting(safeName)}
      ${para(`We received a request to reset the password on your Asset Busters account. If this was you, use the button below to choose a new password. This link is valid for <strong style="color:${T.text};">1 hour</strong> and can only be used once.`)}

      ${ctaBlock("Reset My Password", resetUrl, "Choose a strong, unique password you don't use on other platforms.", T.blue)}

      ${alertBox(
        `<strong>This link expires in 1 hour.</strong> After expiry you will need to submit a new request.<br/><br/>
        If you did <strong>not</strong> request a password reset, please ignore this email — your password will remain unchanged. If you suspect unauthorised access, contact us at
        <a href="mailto:support@assetbusters.com" style="color:${T.blue};text-decoration:none;font-weight:600;">support@assetbusters.com</a> immediately.`,
        "danger",
      )}

      ${hr("4px", "20px")}
      <p style="margin:0 0 8px;font-family:${T.font};font-size:12px;color:${T.t3};">Button not working? Copy and paste this link into your browser:</p>
      ${linkBox(resetUrl)}`;

    const html = emailLayout({
      preheader: "A password reset was requested for your Asset Busters account.",
      header,
      body,
    });

    return this.sendEmail({
      to: email,
      subject: "Password Reset Request — Asset Busters",
      html,
      text: `Hi ${firstName},\n\nReset your Asset Busters password by opening this link:\n\n${resetUrl}\n\nThis link expires in 1 hour. If you did not request this, ignore this email.`,
    });
  }

  //  Welcome email
  static async sendWelcomeEmail(
    email: string,
    firstName: string,
    role: string,
  ) {
    const safeName  = escapeHtml(firstName);
    const safeRole  = escapeHtml(formatRole(role));
    const dashboardUrl = `${env.CLIENT_URL}/dashboard`;

    const roleConfig: Record<string, { icon: string; color: string; tagline: string; step2Title: string; step2Body: string }> = {
      BUSINESS_OWNER:    { icon: "🏢", color: T.blue,   tagline: "Your deal room is open. List your business or raise capital from verified investors.", step2Title: "List your business", step2Body: "Create your first listing in under 10 minutes and reach qualified buyers across Africa." },
      INVESTOR:          { icon: "💰", color: T.amber,  tagline: "Your capital mandate is active. Browse verified listings and set smart deal alerts.", step2Title: "Browse verified listings", step2Body: "Filter by industry, country, and ticket size to find opportunities that match your thesis." },
      FRANCHISE_PARTNER: { icon: "🏪", color: T.green,  tagline: "Franchise opportunities and brand expansion are now within reach.", step2Title: "Explore franchise mandates", step2Body: "Discover brands expanding across Africa or list your own franchise for qualified operators." },
      ADVISOR:           { icon: "🤝", color: T.purple, tagline: "Connect with live M&A mandates that need your advisory expertise.", step2Title: "Showcase your services", step2Body: "Publish your advisory profile and get matched with mandates requiring M&A, legal, or financial expertise." },
    };
    const rc = roleConfig[role] ?? { icon: "⚡", color: T.blue, tagline: "Explore your dashboard and complete your profile.", step2Title: "Complete your profile", step2Body: "A complete profile gets 4× more responses from counterparties." };

    const header = navyHeader({
      eyebrow: "Welcome aboard",
      title: `Your account\nis now active`,
      subtitle: "Everything is set up and ready to go.",
      accentColor: T.green,
    });

    const body = `
      ${greeting(safeName, "🚀")}
      ${para(`Your email has been verified and your Asset Busters account is fully active. ${rc.tagline}`)}

      ${roleBadge(rc.icon, `Joined as ${safeRole}`, rc.color)}

      ${statRow([
        { label: "Businesses listed", value: "2,400+" },
        { label: "Countries covered", value: "45+" },
        { label: "Total deal value",  value: "$2.4B" },
      ])}

      ${hr("4px", "24px")}
      ${sectionLabel("Your next steps")}
      ${stepRow("1", "Complete your mandate profile", "A fully completed profile receives 4× more enquiries from buyers and investors.", T.blue)}
      ${stepRow("2", rc.step2Title, rc.step2Body, rc.color)}
      ${stepRow("3", "Get verified", "Verified accounts unlock full data room access, NDA workflows, and priority deal matching.", T.green)}

      ${ctaBlock("Go to My Dashboard", dashboardUrl, "Your deal workspace is ready.", T.blue)}

      ${hr("4px", "20px")}
      <p style="margin:0;font-family:${T.font};font-size:12px;color:${T.t3};line-height:1.7;text-align:center;">
        Questions? Reply to this email or contact us at&nbsp;<a href="mailto:support@assetbusters.com" style="color:${T.blue};text-decoration:none;font-weight:600;">support@assetbusters.com</a>
      </p>`;

    const html = emailLayout({
      preheader: `Welcome to Asset Busters, ${firstName}. Your account is active and your deal workspace is ready.`,
      header,
      body,
    });

    return this.sendEmail({
      to: email,
      subject: "Welcome to Asset Busters — Your Account Is Active",
      html,
      text: `Hi ${firstName},\n\nYour email has been verified. Welcome to Asset Busters.\n\nGo to your dashboard:\n${dashboardUrl}`,
    });
  }

  // Broadcast / campaign email 
  static async sendBroadcastEmail(
    to: string,
    firstName: string,
    subject: string,
    campaignTitle: string,
    body: string,
  ) {
    const safeName  = escapeHtml(firstName);
    const safeTitle = escapeHtml(campaignTitle);

    // Convert plain body text → HTML paragraphs with basic **bold** support
    const htmlBody = body
      .split(/\n\n+/)
      .map((para) => {
        const safe = escapeHtml(para)
          .replace(/\*\*(.*?)\*\*/g, `<strong style="color:${T.text};font-weight:700;">$1</strong>`)
          .replace(/\n/g, "<br/>");
        return `<p style="margin:0 0 18px;font-family:${T.font};font-size:13px;color:${T.t2};line-height:1.8;">${safe}</p>`;
      })
      .join("");

    const header = navyHeader({
      eyebrow: "Platform Announcement",
      title: safeTitle,
      accentColor: T.amber,
    });

    const emailBody = `
      ${greeting(safeName)}

      <div style="margin:0 0 28px;">
        ${htmlBody}
      </div>

      ${hr()}

      <!-- Sign-off -->
      <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td style="padding:4px 0 0;">
            <p style="margin:0 0 3px;font-family:${T.font};font-size:12px;color:${T.t3};">Warm regards,</p>
            <p style="margin:0;font-family:${T.font};font-size:13px;font-weight:700;color:${T.text};">The Asset Busters Team</p>
          </td>
        </tr>
      </table>

      ${alertBox(
        `You are receiving this message as a registered Asset Busters member. <a href="#" style="color:${T.blue};text-decoration:none;font-weight:600;">Unsubscribe</a> from platform announcements at any time.`,
        "info",
      )}`;

    const html = emailLayout({
      preheader: `${campaignTitle} — from the Asset Busters team.`,
      header,
      body: emailBody,
    });

    return this.sendEmail({
      to,
      subject,
      html,
      text: `Hi ${firstName},\n\n${body}\n\n---\nThe Asset Busters Team`,
    });
  }
}