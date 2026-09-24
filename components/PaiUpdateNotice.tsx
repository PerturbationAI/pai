"use client";

import { useCallback, useEffect, useState } from "react";
import { useI18n } from "@/hooks/useI18n";
import { paiText } from "@/lib/pai-strings";

const POLL_MS = 60_000;

/**
 * Tells the reader when the server has been rebuilt under an open page.
 *
 * Nothing else does. The service worker takes control of an open page without
 * reloading it, and upstream's registration listens for none of that, so a
 * page opened before a deploy keeps running the old bundle until someone
 * happens to reload. On a phone that can be days: an installed web app resumes
 * from memory rather than reloading when you return to it.
 *
 * Which is why this also checks on `visibilitychange` — coming back to the app
 * is exactly the moment the answer is most likely to have changed, and waiting
 * out the poll interval would miss it.
 */
export function PaiUpdateNotice() {
  const { locale } = useI18n();
  const [stale, setStale] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    let baseline: string | null = null;

    const check = async () => {
      try {
        const response = await fetch("/api/pai-build", { cache: "no-store" });
        if (!response.ok) return;
        const body = await response.json() as { buildId?: unknown };
        if (cancelled || typeof body.buildId !== "string") return;
        // A restart is normal; only a *different* build means the page is old.
        if (baseline === null) baseline = body.buildId;
        else if (body.buildId !== baseline) setStale(true);
      } catch {
        // Offline, or the server is mid-restart. The next tick will answer.
      }
    };

    void check();
    const timer = setInterval(() => { void check(); }, POLL_MS);
    const onVisibility = () => { if (document.visibilityState === "visible") void check(); };
    document.addEventListener("visibilitychange", onVisibility);
    return () => {
      cancelled = true;
      clearInterval(timer);
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  const reload = useCallback(() => { window.location.reload(); }, []);

  if (!stale || dismissed) return null;

  return (
    <div className="pai-update-notice" role="status">
      <span className="pai-update-notice-text">{paiText(locale, "updateAvailable")}</span>
      <button type="button" className="pai-update-notice-reload" onClick={reload}>
        {paiText(locale, "reloadNow")}
      </button>
      <button
        type="button"
        className="pai-update-notice-dismiss"
        onClick={() => setDismissed(true)}
        aria-label={paiText(locale, "dismiss")}
        title={paiText(locale, "dismiss")}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          <line x1="6" y1="6" x2="18" y2="18" /><line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      </button>
    </div>
  );
}
