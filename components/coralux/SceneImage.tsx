"use client";

import Image from "next/image";
import { useState } from "react";
import { cn } from "@/lib/utils";

type SceneVariant = "sea" | "sand" | "dusk";

/**
 * Hand-drawn Aruba scene in brand colors — sun, sea and layered surf. Shown
 * beneath every photo so the design holds together while images stream in
 * (and even if a photo ever 404s).
 */
export function SceneArt({
  variant = "sea",
  className,
}: {
  variant?: SceneVariant;
  className?: string;
}) {
  const palettes: Record<
    SceneVariant,
    { sky: [string, string]; sun: string; waves: [string, string, string] }
  > = {
    sea: {
      sky: ["#f7f4ee", "#c2dae0"],
      sun: "#ddc9a3",
      waves: ["#9bc0ca", "#71a1b0", "#538598"],
    },
    sand: {
      sky: ["#fbf9f5", "#e4dcce"],
      sun: "#cfb27f",
      waves: ["#c2dae0", "#9bc0ca", "#71a1b0"],
    },
    dusk: {
      sky: ["#4a3e35", "#2a3f4a"],
      sun: "#cfb27f",
      waves: ["#3f5e6e", "#35505d", "#2a3f4a"],
    },
  };
  const p = palettes[variant];
  const gid = `coralux-sky-${variant}`;

  return (
    <svg
      viewBox="0 0 800 600"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      className={cn("h-full w-full", className)}
    >
      <defs>
        <linearGradient id={gid} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={p.sky[0]} />
          <stop offset="100%" stopColor={p.sky[1]} />
        </linearGradient>
      </defs>
      <rect width="800" height="600" fill={`url(#${gid})`} />
      <circle cx="640" cy="120" r="58" fill={p.sun} opacity="0.85" />
      <path
        d="M0 340 C160 310 320 370 480 345 C620 323 720 340 800 328 L800 600 L0 600 Z"
        fill={p.waves[0]}
        opacity="0.85"
      />
      <path
        d="M0 420 C180 390 340 450 520 420 C660 397 740 420 800 408 L800 600 L0 600 Z"
        fill={p.waves[1]}
        opacity="0.9"
      />
      <path
        d="M0 505 C200 475 380 530 560 502 C690 483 760 505 800 495 L800 600 L0 600 Z"
        fill={p.waves[2]}
      />
      {/* surf lines */}
      <path d="M40 372 C120 362 200 380 280 371" stroke="#fbf9f5" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.5" />
      <path d="M420 452 C500 442 580 460 660 451" stroke="#fbf9f5" strokeWidth="4" strokeLinecap="round" fill="none" opacity="0.45" />
    </svg>
  );
}

/**
 * A photo that fades in over branded scene art. If the photo hasn't loaded
 * (or fails), the art carries the layout — nothing ever looks broken.
 */
export function SceneImage({
  src,
  alt,
  className,
  imgClassName,
  variant = "sea",
  sizes = "100vw",
  priority = false,
}: {
  src: string;
  alt: string;
  className?: string;
  imgClassName?: string;
  variant?: SceneVariant;
  sizes?: string;
  priority?: boolean;
}) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0">
        <SceneArt variant={variant} />
      </div>
      {!failed && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
          className={cn(
            "object-cover transition-opacity duration-700",
            loaded ? "opacity-100" : "opacity-0",
            imgClassName
          )}
        />
      )}
    </div>
  );
}
