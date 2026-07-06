"use client";

import { useActionState } from "react";
import { applyProviderAction } from "@/lib/actions";
import { NEIGHBORHOODS } from "@/lib/config";
import { useT } from "@/lib/i18n/LocaleProvider";
import { Category, User } from "@/lib/types";

export function OnboardingForm({
  categories,
  user,
}: {
  categories: Category[];
  user: User | null;
}) {
  const t = useT();
  const [state, formAction, pending] = useActionState(applyProviderAction, null);

  return (
    <form action={formAction} className="card space-y-5 p-6 md:p-8">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ob-company" className="label">{t("onboard.companyName")} *</label>
          <input id="ob-company" name="companyName" required className="input" />
        </div>
        <div>
          <label htmlFor="ob-contact" className="label">{t("onboard.contactName")}</label>
          <input id="ob-contact" name="contactName" defaultValue={user?.name ?? ""} className="input" />
        </div>
        <div>
          <label htmlFor="ob-email" className="label">{t("onboard.email")} *</label>
          <input id="ob-email" name="email" type="email" required defaultValue={user?.email ?? ""} className="input" />
        </div>
        <div>
          <label htmlFor="ob-phone" className="label">{t("onboard.phone")}</label>
          <input id="ob-phone" name="phone" type="tel" placeholder="+297 …" className="input" />
        </div>
      </div>

      <fieldset>
        <legend className="label">{t("onboard.categories")} *</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {categories.map((c) => (
            <label
              key={c.slug}
              className="flex items-center gap-2 rounded-lg border border-slate-300 p-2.5 text-sm font-medium has-checked:border-brand-600 has-checked:bg-brand-50"
            >
              <input type="checkbox" name="categories" value={c.slug} className="accent-brand-700" />
              <span aria-hidden>{c.icon}</span> {t(`cat.${c.slug}`)}
            </label>
          ))}
        </div>
      </fieldset>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="ob-hood" className="label">{t("onboard.serviceArea")}</label>
          <select id="ob-hood" name="neighborhood" defaultValue="Island-wide" className="input">
            {NEIGHBORHOODS.map((n) => (
              <option key={n} value={n}>{n}</option>
            ))}
          </select>
        </div>
        <div>
          <label htmlFor="ob-addr" className="label">{t("onboard.address")}</label>
          <input id="ob-addr" name="address" className="input" />
        </div>
        <div>
          <label htmlFor="ob-web" className="label">{t("onboard.website")}</label>
          <input id="ob-web" name="website" type="url" placeholder="https://…" className="input" />
        </div>
        <div>
          <label htmlFor="ob-rate" className="label">{t("onboard.rate")}</label>
          <input id="ob-rate" name="hourlyRateAwg" type="number" min="0" step="5" placeholder="e.g. 90" className="input" />
        </div>
      </div>

      <div>
        <label htmlFor="ob-bio" className="label">{t("onboard.bio")}</label>
        <textarea id="ob-bio" name="bio" rows={4} className="input" />
      </div>

      <div>
        <label htmlFor="ob-license" className="label">{t("onboard.license")}</label>
        <input
          id="ob-license"
          name="license"
          type="file"
          accept=".pdf,.png,.jpg,.jpeg"
          className="block w-full text-sm text-slate-500 file:mr-3 file:rounded-lg file:border-0 file:bg-brand-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-brand-700"
        />
      </div>

      {state?.error && (
        <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">
          {state.error}
        </p>
      )}

      <button type="submit" disabled={pending} className="btn-primary w-full">
        {pending ? t("common.loading") : `📋 ${t("onboard.submit")}`}
      </button>
    </form>
  );
}
