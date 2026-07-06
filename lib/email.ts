// Email notifications. Uses Resend when RESEND_API_KEY is set; otherwise logs to
// the server console so demo mode still "sends" visibly without credentials.
import { getBankDetails, SITE_NAME, SITE_URL } from "./config";
import { formatAwgWithUsd } from "./currency";
import { Booking, Invoice, Provider, User } from "./types";

async function send(to: string, subject: string, html: string) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Aruba Home Services <onboarding@resend.dev>";
  if (!apiKey) {
    console.log(
      `[email:demo] To: ${to} | Subject: ${subject}\n${html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 400)}`
    );
    return;
  }
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ from, to, subject, html }),
    });
    if (!res.ok) console.error("[email] Resend error:", await res.text());
  } catch (err) {
    console.error("[email] send failed:", err);
  }
}

const wrap = (body: string) => `
  <div style="font-family:Arial,Helvetica,sans-serif;max-width:560px;margin:0 auto;color:#0f172a">
    <div style="background:#0e7490;color:#fff;padding:16px 24px;border-radius:8px 8px 0 0">
      <strong style="font-size:18px">🌴 ${SITE_NAME}</strong>
    </div>
    <div style="border:1px solid #e2e8f0;border-top:0;padding:24px;border-radius:0 0 8px 8px">
      ${body}
      <p style="color:#64748b;font-size:12px;margin-top:24px">
        ${SITE_NAME} · Oranjestad, Aruba · <a href="${SITE_URL}">${SITE_URL}</a>
      </p>
    </div>
  </div>`;

export async function sendBookingConfirmation(
  customer: User,
  booking: Booking,
  provider: Provider
) {
  await send(
    customer.email,
    `Booking ${booking.ref} confirmed — ${provider.name}`,
    wrap(`
      <h2 style="margin-top:0">Your booking is in! 🎉</h2>
      <p>We sent your request to <strong>${provider.name}</strong>. You'll get another email when they accept.</p>
      <table style="font-size:14px;border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Reference</td><td><strong>${booking.ref}</strong></td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Service</td><td>${booking.categorySlug.replace(/_/g, " ")}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">When</td><td>${booking.asap ? "As soon as possible" : new Date(booking.scheduledAt!).toLocaleString("en-US")}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Where</td><td>${booking.address}, ${booking.neighborhood}</td></tr>
      </table>
      <p><strong>No payment is due now.</strong> After the job is done you'll receive an invoice payable by bank transfer.</p>
      <p><a href="${SITE_URL}/dashboard" style="background:#0e7490;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">View my bookings</a></p>
    `)
  );
}

export async function sendInvoiceEmail(
  customer: User,
  invoice: Invoice,
  booking: Booking,
  provider: Provider
) {
  const bank = getBankDetails();
  await send(
    customer.email,
    `Invoice ${invoice.number} — ${formatAwgWithUsd(invoice.amountAwg)}`,
    wrap(`
      <h2 style="margin-top:0">Invoice for booking ${booking.ref}</h2>
      <p><strong>${provider.name}</strong> completed your job. Amount due:</p>
      <p style="font-size:24px;margin:8px 0"><strong>${formatAwgWithUsd(invoice.amountAwg)}</strong></p>
      <h3>Pay by bank transfer</h3>
      <table style="font-size:14px;border-collapse:collapse">
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Bank</td><td>${bank.bankName}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Account name</td><td>${bank.accountName}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Account number</td><td>${bank.accountNumber}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">IBAN</td><td>${bank.iban}</td></tr>
        <tr><td style="padding:4px 12px 4px 0;color:#64748b">Payment reference</td><td><strong>${invoice.paymentReference}</strong></td></tr>
      </table>
      <p style="color:#b45309"><strong>Important:</strong> include the payment reference so we can match your transfer.</p>
      <p><a href="${SITE_URL}/invoices/${invoice.id}" style="background:#0e7490;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">View invoice & download PDF</a></p>
    `)
  );
}

export async function sendProviderNewJobEmail(
  providerEmail: string,
  booking: Booking,
  provider: Provider
) {
  await send(
    providerEmail,
    `New job request ${booking.ref} for ${provider.name}`,
    wrap(`
      <h2 style="margin-top:0">New job request 🔧</h2>
      <p>${booking.description}</p>
      <p><strong>${booking.address}, ${booking.neighborhood}</strong> · ${booking.asap ? "ASAP" : new Date(booking.scheduledAt!).toLocaleString("en-US")}</p>
      <p><a href="${SITE_URL}/pro" style="background:#0e7490;color:#fff;padding:10px 18px;border-radius:6px;text-decoration:none">Accept or decline</a></p>
    `)
  );
}
