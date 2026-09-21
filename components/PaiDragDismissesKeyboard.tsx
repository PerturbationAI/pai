"use client";

import { useEffect } from "react";

/**
 * Pulling down in the transcript puts the keyboard away.
 *
 * With the keyboard open the transcript is about a third of the screen, so the
 * gesture for "let me see more" is a downward drag. Upstream leaves the
 * keyboard up through it, which means the way back is a tap on whatever narrow
 * strip of transcript is still showing.
 *
 * Only in the transcript. `.chat-content` is the chat column and holds both
 * the transcript and the composer; the drawer, the file viewer and the
 * terminal are siblings of it, each with scrolling of its own. Asking for
 * ancestry inside that column rather than merely "not the composer" is what
 * keeps a downward drag in a terminal from being read as this gesture -- there
 * it is the scroll, and taking the keyboard away on it makes the terminal look
 * as though it will not accept one.
 *
 * A drag that starts inside the composer is not this gesture either -- that is
 * the user placing a caret or selecting text -- and the composer is inside
 * that same column, so it is excluded by its own ancestry. By ancestry rather
 * than by position, since the composer moves with the keyboard.
 *
 * The keyboard state comes from the attribute `PaiKeyboardInset` already sets,
 * so both read the same moment the same way.
 */
const THRESHOLD_PX = 24;

export function PaiDragDismissesKeyboard() {
  useEffect(() => {
    let startY: number | null = null;

    const onStart = (event: TouchEvent) => {
      const target = event.target as Element | null;
      if (event.touches.length !== 1 || !target
        || !target.closest(".chat-content") || target.closest(".pai-composer")) {
        startY = null;
        return;
      }
      startY = event.touches[0].clientY;
    };

    const onMove = (event: TouchEvent) => {
      if (startY === null || event.touches.length !== 1) return;
      if (!document.documentElement.hasAttribute("data-pai-keyboard")) return;
      if (event.touches[0].clientY - startY < THRESHOLD_PX) return;
      startY = null;
      const active = document.activeElement;
      if (active instanceof HTMLElement) active.blur();
      // Focusing a field near the bottom can leave Safari holding the document
      // itself scrolled, which the app's own fixed height never undoes.
      if (window.scrollY !== 0) window.scrollTo(0, 0);
    };

    const onEnd = () => {
      startY = null;
    };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: true });
    document.addEventListener("touchend", onEnd, { passive: true });
    document.addEventListener("touchcancel", onEnd, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", onEnd);
      document.removeEventListener("touchcancel", onEnd);
    };
  }, []);

  return null;
}
