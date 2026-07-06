export function RatingStars({
  rating,
  size = "text-sm",
}: {
  rating: number;
  size?: string;
}) {
  const full = Math.round(rating);
  return (
    <span
      className={`${size} leading-none text-sand-500`}
      role="img"
      aria-label={`${rating.toFixed(1)} out of 5 stars`}
    >
      {"★".repeat(Math.min(5, Math.max(0, full)))}
      <span className="text-slate-300">{"★".repeat(5 - Math.min(5, Math.max(0, full)))}</span>
    </span>
  );
}
