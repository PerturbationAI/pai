"use client";

import Image from "next/image";
import { useState, type FormEvent } from "react";
import { I18nProvider, useI18n } from "@/hooks/useI18n";

function safeDestination(): string {
  const destination = new URLSearchParams(window.location.search).get("next");
  return destination?.startsWith("/") && !destination.startsWith("//") ? destination : "/";
}

function LoginForm() {
  const { t } = useI18n();
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setBusy(true);
    setError("");
    try {
      const response = await fetch("/api/web-auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      if (!response.ok) {
        setError(response.status === 401 ? t("auth.invalidPassword") : t("auth.loginFailed"));
        return;
      }
      window.location.replace(safeDestination());
    } catch {
      setError(t("auth.loginFailed"));
    } finally {
      setBusy(false);
    }
  };

  return (
    <main className="web-login-page">
      <div className="web-login-shell">
        <header className="web-login-brand">
          {/* Unoptimized on purpose. The optimizer's URL is the same whichever icon
              is behind it — `url`, `w` and `q` do not change when the file does — and
              it answers with a four-hour Cache-Control, so a CDN holds the previous
              icon at that URL for four hours after a new one ships. The raw file
              answers with max-age=0 and revalidates. */}
          <Image src="/icons/apple-touch-icon.png" width={52} height={52} alt="" priority unoptimized />
          <div>
            <h1 className="pai-wordmark">PAI</h1>
            <p>{t("auth.prompt")}</p>
          </div>
        </header>
        <form className="web-login-form" onSubmit={submit}>
          <div className="web-login-composer">
            <label className="web-login-label" htmlFor="web-login-password">{t("auth.password")}</label>
            <input
              id="web-login-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t("auth.password")}
              autoComplete="current-password"
              autoFocus
              required
              disabled={busy}
            />
            <button type="submit" disabled={busy || !password}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <line x1="2" y1="7" x2="11" y2="7" />
                <polyline points="7.5 3 12 7 7.5 11" />
              </svg>
              {busy ? t("auth.loggingIn") : t("auth.logIn")}
            </button>
          </div>
          <p className="web-login-error" role="alert" aria-live="polite">{error}</p>
        </form>
      </div>
    </main>
  );
}

export default function LoginPage() {
  return <I18nProvider><LoginForm /></I18nProvider>;
}
