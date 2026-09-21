"use client";

/**
 * Keep the field being edited inside the part of the list still visible.
 *
 * Renaming a session replaces the row with an input in place. On a phone the
 * keyboard then takes half the screen, and a row near the bottom of the list
 * is left clipped by the list's own lower edge -- the name being edited is not
 * on screen at all.
 *
 * `block: "nearest"` moves the list the least amount that brings the row fully
 * into view, so a row already visible is not shoved to the middle.
 *
 * The same settling problem as everywhere else on iOS: the viewport is not its
 * final size when the field is focused, and WebKit does not reliably say when
 * it has finished. So this reads again as it settles and then keeps checking
 * while the edit is open, rather than trusting one measurement or one event.
 */
export function paiRevealWhileEditing(ref: { current: HTMLElement | null }): () => void {
  const reveal = () => ref.current?.scrollIntoView({ block: "nearest", behavior: "auto" });

  const timers = [0, 120, 300, 600].map((delay) => window.setTimeout(reveal, delay));
  const poll = window.setInterval(reveal, 500);
  const viewport = window.visualViewport;
  viewport?.addEventListener("resize", reveal);

  return () => {
    for (const id of timers) window.clearTimeout(id);
    window.clearInterval(poll);
    viewport?.removeEventListener("resize", reveal);
  };
}
