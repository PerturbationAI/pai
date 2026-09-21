"use client";

import { useEffect } from "react";

/**
 * Marks the document while a mobile keyboard is open.
 *
 * Upstream already shrinks the app to `visualViewport.height` when the keyboard
 * appears, which is the hard half. What it does not do is drop the bottom
 * safe-area inset, so the composer keeps reserving room for a home indicator
 * that the keyboard is covering. Measured on an iPhone 17 Pro in standalone:
 * the composer ends 34pt above the app's own bottom edge, with the keyboard
 * below that — a gap the reader reads as the composer floating.
 *
 * The detection matches upstream's `useViewportHeight` deliberately, so the
 * attribute and `--app-viewport-height` are never set from different readings
 * of the same moment.
 */
export function PaiKeyboardInset() {
  useEffect(() => {
    const viewport = window.visualViewport;
    if (!viewport) return;

    const root = document.documentElement;
    let frame: number | null = null;

    const isEditable = () => {
      const active = document.activeElement;
      return active instanceof HTMLElement
        && (active.isContentEditable || active.tagName === "INPUT" || active.tagName === "TEXTAREA");
    };

    const apply = () => {
      frame = null;
      const editable = isEditable();
      const unscaled = Math.abs(viewport.scale - 1) < 0.01;
      const shrunk = window.innerHeight - viewport.height > 1;

      // Losing focus is not the keyboard leaving. Tapping Send blurs the
      // field first, and anything that unwinds on that blur moves the button
      // out from under the finger before the tap has finished -- the tap then
      // lands on whatever took its place, and it takes a second one to send.
      // So both of these are dropped when the keyboard is measurably gone,
      // not when the focus is.
      if (editable && unscaled && shrunk) {
        root.setAttribute("data-pai-keyboard", "");
      } else if (!shrunk) {
        root.removeAttribute("data-pai-keyboard");
      }

      // Set the moment a field is focused rather than once the viewport has
      // finished shrinking. Anything laid out against the keyboard's arrival
      // has to start moving when the keyboard does: the height only settles
      // after the animation, so a layout that waits for it moves once with
      // the shrinking viewport and again when this lands, and those two are
      // in opposite directions.
      if (editable && unscaled) {
        root.setAttribute("data-pai-editing", "");
      } else if (!shrunk) {
        root.removeAttribute("data-pai-editing");
      }
    };

    // WebKit reports a half-settled height on the resize event itself, the same
    // reason upstream reads on the next frame.
    // Same settling problem as upstream's hook: one read taken partway through
    // the keyboard animation sees the two heights agree and concludes there is
    // no keyboard, with nothing afterwards to correct it.
    let settleTimers: number[] = [];
    const readSoon = () => {
      if (frame !== null) window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(apply);
    };
    const schedule = () => {
      for (const id of settleTimers) window.clearTimeout(id);
      readSoon();
      settleTimers = [120, 300, 600].map((delay) => window.setTimeout(readSoon, delay));
    };

    // Same reason as upstream's hook: a restored web app can come back with
    // the keyboard already open and no event to say so.
    const poll = window.setInterval(readSoon, 500);

    schedule();
    viewport.addEventListener("resize", schedule);
    viewport.addEventListener("scroll", schedule);
    // `apply` directly rather than `schedule`: the whole point of the editing
    // attribute is that it lands in the same frame as the focus, not after a
    // frame the keyboard has already started animating through.
    window.addEventListener("focusin", apply);
    window.addEventListener("focusout", apply);
    return () => {
      viewport.removeEventListener("resize", schedule);
      viewport.removeEventListener("scroll", schedule);
      window.removeEventListener("focusin", apply);
      window.removeEventListener("focusout", apply);
      window.clearInterval(poll);
      for (const id of settleTimers) window.clearTimeout(id);
      if (frame !== null) window.cancelAnimationFrame(frame);
      root.removeAttribute("data-pai-keyboard");
      root.removeAttribute("data-pai-editing");
    };
  }, []);

  return null;
}
