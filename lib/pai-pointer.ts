/**
 * Whether the device the page is on can actually hover.
 *
 * Upstream reveals a session row's rename and delete buttons on `mouseenter`.
 * A touch screen has no hover, so iOS synthesises `mouseenter` from the first
 * tap: the buttons appear, the row reflows under the finger, and that tap never
 * reaches the row. Opening a session costs two taps, which is what this answers.
 *
 * Read on each call rather than cached, because the answer changes when a
 * keyboard or trackpad is paired with an iPad mid-session.
 */
export function canHover(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(hover: hover)").matches;
}

/**
 * The width the phone layout is written for, read the same way the stylesheet
 * reads it so the two cannot disagree about which screen this is.
 */
export function isNarrowScreen(): boolean {
  if (typeof window === "undefined" || !window.matchMedia) return false;
  return window.matchMedia("(max-width: 640px)").matches;
}
