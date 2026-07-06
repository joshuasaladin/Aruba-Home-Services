"use client";

import { createContext, useContext, ReactNode } from "react";
import { Locale, translate } from "./dictionaries";

const LocaleContext = createContext<Locale>("en");

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: ReactNode;
}) {
  return (
    <LocaleContext.Provider value={locale}>{children}</LocaleContext.Provider>
  );
}

export function useLocale(): Locale {
  return useContext(LocaleContext);
}

/** Client-component translator hook. */
export function useT() {
  const locale = useLocale();
  return (key: string) => translate(locale, key);
}
