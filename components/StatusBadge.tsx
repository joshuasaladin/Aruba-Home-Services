import { BookingStatus, PaymentStatus } from "@/lib/types";

const BOOKING_STYLES: Record<BookingStatus, string> = {
  pending: "bg-sand-100 text-amber-800",
  accepted: "bg-brand-100 text-brand-800",
  declined: "bg-rose-100 text-rose-700",
  completed: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-slate-200 text-slate-600",
};

const PAYMENT_STYLES: Record<PaymentStatus, string> = {
  pending: "bg-slate-100 text-slate-600",
  invoiced: "bg-sand-100 text-amber-800",
  paid: "bg-emerald-100 text-emerald-800",
};

export function BookingStatusBadge({
  status,
  label,
}: {
  status: BookingStatus;
  label: string;
}) {
  return <span className={`badge ${BOOKING_STYLES[status]}`}>{label}</span>;
}

export function PaymentStatusBadge({
  status,
  label,
}: {
  status: PaymentStatus;
  label: string;
}) {
  return <span className={`badge ${PAYMENT_STYLES[status]}`}>{label}</span>;
}
