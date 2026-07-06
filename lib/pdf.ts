// Invoice PDF generation with pdf-lib (pure JS — works everywhere, no browser needed).
import { PDFDocument, rgb, StandardFonts } from "pdf-lib";
import { getBankDetails, SITE_NAME } from "./config";
import { awgToUsd } from "./currency";
import { Booking, Invoice, Provider, User } from "./types";

const TEAL = rgb(0.055, 0.455, 0.565);
const SLATE = rgb(0.06, 0.09, 0.16);
const GRAY = rgb(0.39, 0.45, 0.55);
const LIGHT = rgb(0.945, 0.961, 0.976);
const AMBER = rgb(0.71, 0.4, 0.05);
const GREEN = rgb(0.09, 0.55, 0.33);

function money(awg: number): string {
  return `Afl. ${awg.toFixed(2)}`;
}

/** Standard PDF fonts only support WinAnsi — strip anything they can't encode. */
function safe(text: string): string {
  // eslint-disable-next-line no-control-regex
  return text
    .replace(/[≈]/g, "approx.")
    .replace(/[–—]/g, "-")
    .replace(/[""]/g, '"')
    .replace(/['']/g, "'")
    .replace(/[^\x20-\x7E -ÿ]/g, "")
    .replace(/ {2,}/g, " ");
}

export async function generateInvoicePdf(
  invoice: Invoice,
  booking: Booking,
  provider: Provider,
  customer: User
): Promise<Uint8Array> {
  const bank = getBankDetails();
  const doc = await PDFDocument.create();
  const page = doc.addPage([595, 842]); // A4
  const font = await doc.embedFont(StandardFonts.Helvetica);
  const bold = await doc.embedFont(StandardFonts.HelveticaBold);
  const { width, height } = page.getSize();
  const margin = 48;

  // Sanitize every string drawn so user input (emoji, unusual symbols) can
  // never crash PDF generation.
  const rawDrawText = page.drawText.bind(page);
  page.drawText = ((text: string, opts?: Parameters<typeof rawDrawText>[1]) =>
    rawDrawText(safe(text ?? ""), opts)) as typeof page.drawText;

  // Header band
  page.drawRectangle({ x: 0, y: height - 110, width, height: 110, color: TEAL });
  page.drawText(SITE_NAME, {
    x: margin,
    y: height - 58,
    size: 22,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText("Every home-service pro on Aruba, one booking away", {
    x: margin,
    y: height - 78,
    size: 10,
    font,
    color: rgb(0.85, 0.95, 0.97),
  });
  page.drawText("INVOICE", {
    x: width - margin - 100,
    y: height - 58,
    size: 22,
    font: bold,
    color: rgb(1, 1, 1),
  });
  page.drawText(invoice.number, {
    x: width - margin - 100,
    y: height - 78,
    size: 11,
    font,
    color: rgb(0.85, 0.95, 0.97),
  });

  let y = height - 150;
  const line = (label: string, value: string, x: number, w = 220) => {
    page.drawText(label.toUpperCase(), { x, y, size: 8, font: bold, color: GRAY });
    const lines = wrap(value, w, font, 11);
    lines.forEach((ln, i) => {
      page.drawText(ln, { x, y: y - 14 - i * 13, size: 11, font, color: SLATE });
    });
    return 14 + lines.length * 13;
  };

  function wrap(text: string, maxWidth: number, f: typeof font, size: number): string[] {
    const words = safe(text).split(/\s+/);
    const out: string[] = [];
    let cur = "";
    for (const w of words) {
      const test = cur ? `${cur} ${w}` : w;
      if (f.widthOfTextAtSize(test, size) > maxWidth && cur) {
        out.push(cur);
        cur = w;
      } else cur = test;
    }
    if (cur) out.push(cur);
    return out.length ? out : [""];
  }

  // Billed to / Provider columns
  const hLeft = line("Billed to", `${customer.name}\n${customer.email}`.replace("\n", " — "), margin);
  line("Provider", `${provider.name} — ${provider.address}`, width / 2);
  y -= Math.max(hLeft, 40) + 18;

  line("Issue date", new Date(invoice.issuedAt).toLocaleDateString("en-US", { dateStyle: "long" }), margin);
  line("Booking reference", booking.ref, width / 2);
  y -= 50;

  // Item table
  page.drawRectangle({ x: margin, y: y - 6, width: width - margin * 2, height: 24, color: LIGHT });
  page.drawText("DESCRIPTION", { x: margin + 10, y, size: 9, font: bold, color: GRAY });
  page.drawText("AMOUNT", { x: width - margin - 80, y, size: 9, font: bold, color: GRAY });
  y -= 28;
  const desc = `${booking.categorySlug.replace(/_/g, " ")} — ${booking.description}`;
  const descLines = wrap(desc, width - margin * 2 - 130, font, 10);
  descLines.slice(0, 4).forEach((ln) => {
    page.drawText(ln, { x: margin + 10, y, size: 10, font, color: SLATE });
    y -= 13;
  });
  page.drawText(money(invoice.amountAwg), {
    x: width - margin - 80,
    y: y + descLines.slice(0, 4).length * 13 - 13,
    size: 10,
    font,
    color: SLATE,
  });
  y -= 10;
  page.drawLine({
    start: { x: margin, y },
    end: { x: width - margin, y },
    thickness: 0.5,
    color: rgb(0.8, 0.84, 0.9),
  });
  y -= 26;

  // Total
  page.drawText("TOTAL DUE", { x: width - margin - 200, y, size: 10, font: bold, color: GRAY });
  page.drawText(money(invoice.amountAwg), {
    x: width - margin - 110,
    y,
    size: 16,
    font: bold,
    color: SLATE,
  });
  y -= 16;
  page.drawText(`≈ $${awgToUsd(invoice.amountAwg).toFixed(2)} USD (pegged 1 USD = 1.79 AWG)`, {
    x: width - margin - 200,
    y,
    size: 9,
    font,
    color: GRAY,
  });
  y -= 20;

  // Status stamp
  const paid = invoice.status === "paid";
  page.drawText(paid ? "PAID — THANK YOU" : "AWAITING BANK TRANSFER", {
    x: margin,
    y: y + 26,
    size: 13,
    font: bold,
    color: paid ? GREEN : AMBER,
  });
  y -= 30;

  // Bank transfer box
  const boxH = 150;
  page.drawRectangle({
    x: margin,
    y: y - boxH,
    width: width - margin * 2,
    height: boxH,
    color: LIGHT,
    borderColor: TEAL,
    borderWidth: 1,
  });
  let by = y - 24;
  page.drawText("HOW TO PAY — BANK TRANSFER (NO CARD / ONLINE PAYMENT)", {
    x: margin + 14,
    y: by,
    size: 10,
    font: bold,
    color: TEAL,
  });
  by -= 20;
  const bankRows: [string, string][] = [
    ["Bank", bank.bankName],
    ["Account name", bank.accountName],
    ["Account number", bank.accountNumber],
    ["IBAN", bank.iban],
    ["SWIFT", bank.swift],
    ["Payment reference", invoice.paymentReference],
  ];
  for (const [label, value] of bankRows) {
    page.drawText(label, { x: margin + 14, y: by, size: 9, font, color: GRAY });
    page.drawText(value, {
      x: margin + 140,
      y: by,
      size: 9,
      font: label === "Payment reference" ? bold : font,
      color: SLATE,
    });
    by -= 16;
  }
  by -= 2;
  page.drawText(
    "Include the payment reference with your transfer so we can match it to this invoice.",
    { x: margin + 14, y: by, size: 8, font, color: AMBER }
  );

  // Footer
  page.drawText(
    `${SITE_NAME} · Oranjestad, Aruba · Invoice ${invoice.number} · Booking ${booking.ref}`,
    { x: margin, y: 40, size: 8, font, color: GRAY }
  );

  return doc.save();
}
