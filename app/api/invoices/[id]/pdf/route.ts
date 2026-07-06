import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth";
import { getDb } from "@/lib/data";
import { generateInvoicePdf } from "@/lib/pdf";

export async function GET(
  _request: NextRequest,
  context: { params: Promise<{ id: string }> }
) {
  const { id } = await context.params;
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.redirect(new URL(`/login?next=/invoices/${id}`, _request.url));
  }

  const db = getDb();
  const invoice = await db.getInvoice(id);
  if (!invoice) return new NextResponse("Not found", { status: 404 });

  const allowed =
    user.role === "admin" ||
    invoice.customerId === user.id ||
    (user.providerId && user.providerId === invoice.providerId);
  if (!allowed) return new NextResponse("Forbidden", { status: 403 });

  const [booking, provider, customer] = await Promise.all([
    db.getBooking(invoice.bookingId),
    db.getProviderById(invoice.providerId),
    db.getUserById(invoice.customerId),
  ]);
  if (!booking || !provider) return new NextResponse("Not found", { status: 404 });

  const pdf = await generateInvoicePdf(
    invoice,
    booking,
    provider,
    customer ?? user
  );

  return new NextResponse(Buffer.from(pdf), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${invoice.number}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
