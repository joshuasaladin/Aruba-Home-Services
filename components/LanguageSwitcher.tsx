"use client";

import { usePathname } from "next/navigation";
import { useTransition } from "react";
import { setLocaleAction } from "@/lib/actions";
import { useLocale } from "@/lib/i18n/LocaleProvider";
import { LOCALES, LOCALE_NAMES } from "@/lib/i18n/dictionaries";

export function LanguageSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const [pending, startTransition] = useTransition();

  return (
    <label className="inline-flex items-center gap-1">
      <span className="sr-only">Language</span>
      <span aria-hidden className="text-sm">🌐</span>
      <select
        value={locale}
        disabled={pending}
        onChange={(e) =>
          startTransition(() => setLocaleAction(e.target.value, pathname))
        }
        className="rounded-lg border border-slate-300 bg-white px-2 py-1.5 text-sm font-medium text-slate-700 focus:border-brand-600"
      >
        {LOCALES.map((l) => (
          <option key={l} value={l}>
            {LOCALE_NAMES[l]}
          </option>
        ))}
      </select>
    </label>
  );
}
