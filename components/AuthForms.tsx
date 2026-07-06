"use client";

import Link from "next/link";
import { useActionState, useTransition } from "react";
import { demoLoginAction, loginAction, signupAction } from "@/lib/actions";
import { useT } from "@/lib/i18n/LocaleProvider";
import { Role } from "@/lib/types";

function DemoQuickLogin({ next }: { next?: string }) {
  const t = useT();
  const [pending, startTransition] = useTransition();
  const buttons: [Role, string, string][] = [
    ["customer", "🧑", t("auth.demoCustomer")],
    ["provider", "🔧", t("auth.demoProvider")],
    ["admin", "🛡️", t("auth.demoAdmin")],
  ];
  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50 p-4">
      <p className="font-bold text-brand-900">⚡ {t("auth.demoTitle")}</p>
      <p className="mt-1 text-sm text-brand-800">{t("auth.demoHint")}</p>
      <div className="mt-3 grid gap-2 sm:grid-cols-3">
        {buttons.map(([role, icon, label]) => (
          <button
            key={role}
            type="button"
            disabled={pending}
            onClick={() => startTransition(() => demoLoginAction(role, next))}
            className="btn-secondary !py-2 text-sm"
          >
            {icon} {label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function LoginForm({
  demoMode,
  next,
}: {
  demoMode: boolean;
  next?: string;
}) {
  const t = useT();
  const [state, formAction, pending] = useActionState(loginAction, null);

  return (
    <div className="space-y-6">
      {demoMode && <DemoQuickLogin next={next} />}
      <form action={formAction} className="card space-y-4 p-6">
        <h1 className="text-2xl font-extrabold text-slate-900">{t("auth.loginTitle")}</h1>
        <input type="hidden" name="next" value={next || ""} />
        <div>
          <label htmlFor="login-email" className="label">{t("auth.email")}</label>
          <input id="login-email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        {!demoMode && (
          <div>
            <label htmlFor="login-pass" className="label">{t("auth.password")}</label>
            <input id="login-pass" name="password" type="password" required autoComplete="current-password" className="input" />
          </div>
        )}
        {state?.error && (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? t("common.loading") : t("auth.loginButton")}
        </button>
        {!demoMode && (
          <a href="/auth/google" className="btn-secondary w-full">
            <svg width="16" height="16" viewBox="0 0 24 24" aria-hidden>
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.27-4.74 3.27-8.1z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84A11 11 0 0 0 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.1A6.6 6.6 0 0 1 5.5 12c0-.73.13-1.44.34-2.1V7.06H2.18a11 11 0 0 0 0 9.88l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15A11 11 0 0 0 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
            </svg>
            {t("auth.google")}
          </a>
        )}
        <p className="text-center text-sm text-slate-500">
          {t("auth.noAccount")}{" "}
          <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-700 hover:underline">
            {t("nav.signup")}
          </Link>
        </p>
      </form>
    </div>
  );
}

export function SignupForm({
  demoMode,
  next,
}: {
  demoMode: boolean;
  next?: string;
}) {
  const t = useT();
  const [state, formAction, pending] = useActionState(signupAction, null);

  return (
    <div className="space-y-6">
      {demoMode && <DemoQuickLogin next={next} />}
      <form action={formAction} className="card space-y-4 p-6">
        <h1 className="text-2xl font-extrabold text-slate-900">{t("auth.signupTitle")}</h1>
        <input type="hidden" name="next" value={next || ""} />
        <div>
          <label htmlFor="su-name" className="label">{t("auth.name")}</label>
          <input id="su-name" name="name" required autoComplete="name" className="input" />
        </div>
        <div>
          <label htmlFor="su-email" className="label">{t("auth.email")}</label>
          <input id="su-email" name="email" type="email" required autoComplete="email" className="input" />
        </div>
        {!demoMode && (
          <div>
            <label htmlFor="su-pass" className="label">{t("auth.password")}</label>
            <input id="su-pass" name="password" type="password" required minLength={8} autoComplete="new-password" className="input" />
          </div>
        )}
        <fieldset>
          <legend className="label">{t("auth.role")}</legend>
          <div className="grid gap-2 sm:grid-cols-2">
            <label className="flex items-center gap-2 rounded-lg border border-slate-300 p-3 text-sm font-semibold has-checked:border-brand-600 has-checked:bg-brand-50">
              <input type="radio" name="role" value="customer" defaultChecked className="accent-brand-700" />
              🧑 {t("auth.roleCustomer")}
            </label>
            <label className="flex items-center gap-2 rounded-lg border border-slate-300 p-3 text-sm font-semibold has-checked:border-brand-600 has-checked:bg-brand-50">
              <input type="radio" name="role" value="provider" className="accent-brand-700" />
              🔧 {t("auth.roleProvider")}
            </label>
          </div>
        </fieldset>
        {state?.error && (
          <p role="alert" className="rounded-lg bg-rose-50 p-3 text-sm font-semibold text-rose-700">
            {state.error}
          </p>
        )}
        <button type="submit" disabled={pending} className="btn-primary w-full">
          {pending ? t("common.loading") : t("auth.signupButton")}
        </button>
        <p className="text-center text-sm text-slate-500">
          {t("auth.haveAccount")}{" "}
          <Link href={`/login${next ? `?next=${encodeURIComponent(next)}` : ""}`} className="font-semibold text-brand-700 hover:underline">
            {t("nav.login")}
          </Link>
        </p>
      </form>
    </div>
  );
}
