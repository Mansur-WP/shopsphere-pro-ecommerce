import { Resend } from "resend";

const from =
  process.env.EMAIL_FROM || "Africhina Connect <onboarding@resend.dev>";

function getResend() {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  return new Resend(key);
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  html: string;
}) {
  const resend = getResend();

  if (!resend) {
    console.info(
      `[email:demo] To: ${options.to} | ${options.subject}\n${options.html.replace(/<[^>]+>/g, " ").slice(0, 200)}…`
    );
    return { success: true as const, demo: true };
  }

  try {
    await resend.emails.send({
      from,
      to: options.to,
      subject: options.subject,
      html: options.html,
    });
    return { success: true as const, demo: false };
  } catch (error) {
    console.error("[email] send failed:", error);
    return { success: false as const, error };
  }
}

function layout(title: string, body: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return `<!DOCTYPE html>
<html>
<body style="margin:0;font-family:system-ui,-apple-system,sans-serif;background:#0f172a;color:#e2e8f0;">
  <div style="max-width:560px;margin:32px auto;padding:32px;background:#1e293b;border-radius:16px;">
    <p style="margin:0 0 8px;font-size:13px;letter-spacing:0.08em;text-transform:uppercase;color:#3b82f6;">Africhina Connect</p>
    <h1 style="margin:0 0 16px;font-size:22px;color:#f8fafc;">${title}</h1>
    <div style="font-size:15px;line-height:1.6;color:#cbd5e1;">${body}</div>
    <p style="margin:28px 0 0;font-size:12px;color:#64748b;">
      <a href="${appUrl}" style="color:#3b82f6;text-decoration:none;">Visit Africhina Connect</a>
    </p>
  </div>
</body>
</html>`;
}

export async function sendWelcomeEmail(to: string, name?: string | null) {
  return sendEmail({
    to,
    subject: "Welcome to Africhina Connect",
    html: layout(
      `Welcome${name ? `, ${name}` : ""}!`,
      `<p>Your account is ready. Explore quality trade and consumer goods, save favorites, and checkout securely.</p>
       <p>Welcome aboard.</p>`
    ),
  });
}

export async function sendOrderConfirmationEmail(options: {
  to: string;
  orderNumber: string;
  total: string;
  orderId: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return sendEmail({
    to: options.to,
    subject: `Order confirmed · ${options.orderNumber}`,
    html: layout(
      "Order confirmed",
      `<p>Thanks for your purchase. We’ve received order <strong>${options.orderNumber}</strong> for <strong>${options.total}</strong>.</p>
       <p><a href="${appUrl}/orders/${options.orderId}" style="color:#34d399;">View your order</a></p>`
    ),
  });
}

export async function sendPaymentSuccessEmail(options: {
  to: string;
  orderNumber: string;
  total: string;
  orderId: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return sendEmail({
    to: options.to,
    subject: `Payment received · ${options.orderNumber}`,
    html: layout(
      "Payment successful",
      `<p>Payment for order <strong>${options.orderNumber}</strong> (${options.total}) was successful. Our fulfillment team is preparing your items.</p>
       <p><a href="${appUrl}/orders/${options.orderId}" style="color:#34d399;">Track your order</a></p>`
    ),
  });
}

export async function sendSellerApprovalEmail(options: {
  to: string;
  storeName: string;
  approved: boolean;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  if (options.approved) {
    return sendEmail({
      to: options.to,
      subject: `Account approved · ${options.storeName}`,
      html: layout(
        "You're approved!",
        `<p>Congratulations — <strong>${options.storeName}</strong> is active on Africhina Connect.</p>
         <p><a href="${appUrl}/staff/dashboard" style="color:#34d399;">Open staff dashboard</a></p>`
      ),
    });
  }
  return sendEmail({
    to: options.to,
    subject: `Application update · ${options.storeName}`,
    html: layout(
      "Application not approved",
      `<p>We couldn’t approve <strong>${options.storeName}</strong> at this time. You can update your details and apply again.</p>`
    ),
  });
}

export async function sendOrderStatusEmail(options: {
  to: string;
  orderNumber: string;
  status: string;
  orderId: string;
}) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  return sendEmail({
    to: options.to,
    subject: `Order ${options.orderNumber} · ${options.status}`,
    html: layout(
      "Order status update",
      `<p>Your order <strong>${options.orderNumber}</strong> is now <strong>${options.status}</strong>.</p>
       <p><a href="${appUrl}/orders/${options.orderId}" style="color:#34d399;">View order</a></p>`
    ),
  });
}
