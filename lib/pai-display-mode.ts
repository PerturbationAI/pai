"use client";

/**
 * Whether the page is running as an installed application rather than in a
 * browser tab.
 *
 * The distinction matters wherever the browser's own chrome is what would
 * otherwise get the reader out of somewhere: a new tab, a back gesture, a tab
 * bar. Installed, none of that exists.
 *
 * `navigator.standalone` is what iOS sets for a home screen web app; the media
 * query is the standard every other browser answers.
 */
export function isInstalledApp(): boolean {
  if (typeof window === "undefined") return false;
  const ios = (window.navigator as unknown as { standalone?: boolean }).standalone;
  return Boolean(ios) || window.matchMedia("(display-mode: standalone)").matches;
}
