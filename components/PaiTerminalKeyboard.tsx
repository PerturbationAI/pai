"use client";

import { useEffect } from "react";

/**
 * Let a tap in the terminal raise the keyboard.
 *
 * iOS raises the keyboard when a focus *lands* inside a user gesture, and at
 * no other time. xterm focuses its own hidden textarea as soon as the
 * connection opens and again whenever its tab becomes active -- both long
 * before a thumb arrives -- so by the time the terminal is tapped that
 * textarea is already the active element. The tap changes nothing, and the
 * keyboard never comes up. Tapping again cannot help: the state it would
 * change is already the state it wants.
 *
 * What it looks like from the outside is a terminal that will not take input
 * at all, and the way out that people find is to send the app to the
 * background and come back -- which works only because iOS drops the focus on
 * the way, so the next tap is a change again.
 *
 * So: give the focus back when it was taken without a gesture. A focus that
 * lands on one of those textareas with no touch *in that terminal* just behind
 * it is xterm's own, not the reader's, and releasing it leaves the first tap
 * free to do what iOS needs. A focus that follows a touch inside the terminal
 * is the reader's and is left alone.
 *
 * In that terminal, rather than anywhere: the tap that opens one lands on a
 * button in the drawer, and the connection can open inside the same breath, so
 * a plain "was there a touch just now" reads xterm's own focus as the
 * reader's and keeps it -- which is the state this exists to avoid.
 *
 * Re-seating the focus inside the tap was tried first and does not work:
 * `blur()` and `focus()` in one block read as no change at all.
 *
 * Coarse pointers only. A desktop terminal should keep the focus it takes --
 * there is no keyboard to raise and the auto-focus is the convenience it was
 * written to be.
 */
const GESTURE_WINDOW_MS = 400;

export function PaiTerminalKeyboard() {
  useEffect(() => {
    if (!window.matchMedia("(pointer: coarse)").matches) return;

    let lastTouch = 0;
    let lastTouched: Element | null = null;

    const onTouch = (event: TouchEvent) => {
      const terminal = (event.target as Element | null)?.closest(".terminal-xterm") ?? null;
      if (!terminal) return;
      lastTouch = Date.now();
      lastTouched = terminal;
    };

    const onFocusIn = (event: FocusEvent) => {
      const target = event.target as Element | null;
      if (!target?.classList.contains("xterm-helper-textarea")) return;
      const terminal = target.closest(".terminal-xterm");
      if (terminal && terminal === lastTouched && Date.now() - lastTouch < GESTURE_WINDOW_MS) return;
      (target as HTMLTextAreaElement).blur();
    };

    document.addEventListener("touchstart", onTouch, { passive: true, capture: true });
    document.addEventListener("touchend", onTouch, { passive: true, capture: true });
    document.addEventListener("focusin", onFocusIn);
    return () => {
      document.removeEventListener("touchstart", onTouch, { capture: true });
      document.removeEventListener("touchend", onTouch, { capture: true });
      document.removeEventListener("focusin", onFocusIn);
    };
  }, []);

  return null;
}
