import Link from "next/link";
import { cn } from "@/lib/utils";

/** Branching fan-coral glyph — stands in for the "O" of CORALUX, as in the logo. */
export function CoralGlyph({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      stroke="currentColor"
      strokeLinecap="round"
      aria-hidden="true"
      className={className}
    >
      {/* trunk */}
      <path d="M32 60 C32 54 32 50 32 45" strokeWidth="5" />
      {/* center stem + offshoots */}
      <path d="M32 47 C32 38 31.5 26 32 12" strokeWidth="4.4" />
      <path d="M32 27 C36 23 38.5 19 39 12" strokeWidth="3.6" />
      <path d="M32 36 C28 32 26 28 25.5 22" strokeWidth="3.6" />
      {/* left branch + offshoots */}
      <path d="M32 48 C25 44 20.5 39 18.5 32 C17.5 28.5 17 24 17.5 19" strokeWidth="4" />
      <path d="M19.5 34 C15 32 11.5 28 10 22" strokeWidth="3.2" />
      <path d="M22 41 C17.5 41 13 39 9.5 35" strokeWidth="3" />
      {/* right branch + offshoots */}
      <path d="M32 48 C39 44 43.5 39 45.5 32 C46.5 28.5 47 24 46.5 19" strokeWidth="4" />
      <path d="M44.5 34 C49 32 52.5 28 54 22" strokeWidth="3.2" />
      <path d="M42 41 C46.5 41 51 39 54.5 35" strokeWidth="3" />
    </svg>
  );
}

/**
 * The Coralux wordmark: CORALUX in the display serif with the coral glyph as
 * the O, plus the "Luxury Property Management" strapline underneath.
 */
export function CoraluxLogo({
  className,
  glyphClassName = "text-lagoon-600",
  withTagline = true,
  href = "/coralux",
}: {
  className?: string;
  glyphClassName?: string;
  withTagline?: boolean;
  href?: string;
}) {
  return (
    <Link
      href={href}
      className={cn("group inline-flex flex-col items-center gap-1", className)}
      aria-label="Coralux — Luxury Property Management"
    >
      <span className="flex items-center font-display text-[1.6em] font-semibold leading-none tracking-[0.18em]">
        <span>C</span>
        <CoralGlyph
          className={cn(
            "mx-[0.06em] h-[0.92em] w-[0.92em] translate-y-[-0.04em] transition-transform duration-300 group-hover:scale-110",
            glyphClassName
          )}
        />
        <span>RALUX</span>
      </span>
      {withTagline && (
        <span className="font-body text-[0.55em] font-semibold uppercase tracking-[0.34em] text-lagoon-600">
          Luxury Property Management
        </span>
      )}
    </Link>
  );
}
