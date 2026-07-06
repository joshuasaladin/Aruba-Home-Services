import { cookies } from "next/headers";
import {
  DEFAULT_LOCALE,
  LOCALES,
  Locale,
  translate,
} from "./dictionaries";

export async function getLocale(): Promise<Locale> {
  const store = await cookies();
  const value = store.get("locale")?.value;
  return LOCALES.includes(value as Locale) ? (value as Locale) : DEFAULT_LOCALE;
}

/** Server-component translator: `const t = await getT(); t("home.heroTitle")` */
export async function getT() {
  const locale = await getLocale();
  const t = (key: string) => translate(locale, key);
  t.locale = locale;
  return t;
}
