"use client";

import { useEffect, useRef } from "react";

import { isInstalledApp } from "./pai-display-mode";

/**
 * Dragging in from the left edge opens the sidebar.
 *
 * On a phone the sidebar is reachable only through the toolbar button, which
 * is the one control in the top-left corner and the furthest point from a
 * thumb. Every phone application with a drawer opens it from the edge instead.
 *
 * The gesture must begin inside the edge zone rather than on it: the outermost
 * few points belong to the system's own back gesture, and a web page cannot
 * take those from it.
 *
 * Only in a home screen app. In a browser tab the same drag is how iOS goes
 * back, and there is a real history stack behind it, so the two gestures would
 * be competing for the same movement over the same pixels. Installed, there is
 * nothing to go back to and the edge is free.
 *
 * Listeners are on the document rather than on an element, so nothing about
 * the layout has to change to carry them.
 */
const EDGE_ZONE_PX = 32;
const OPEN_TRAVEL_PX = 56;
const AXIS_DECISION_PX = 10;

export function usePaiEdgeSwipe({ onOpen, enabled }: { onOpen: () => void; enabled: boolean }) {
  const open = useRef(onOpen);
  open.current = onOpen;

  useEffect(() => {
    if (!enabled || !isInstalledApp()) return;
    let from: { x: number; y: number } | null = null;
    let axis: "x" | "y" | null = null;

    const onStart = (event: TouchEvent) => {
      axis = null;
      const touch = event.touches[0];
      from = event.touches.length === 1 && touch.clientX <= EDGE_ZONE_PX
        ? { x: touch.clientX, y: touch.clientY }
        : null;
    };

    const onMove = (event: TouchEvent) => {
      if (!from || event.touches.length !== 1) return;
      const dx = event.touches[0].clientX - from.x;
      const dy = event.touches[0].clientY - from.y;
      if (axis === null) {
        // Same reason as the row swipe: a displacement of a few pixels cannot
        // tell intent from the noise of a thumb settling.
        if (Math.hypot(dx, dy) < AXIS_DECISION_PX) return;
        axis = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      }
      if (axis !== "x") return;
      // Once the gesture is known to be sideways the page must stop reacting
      // to it. Without this the drag's vertical component scrolls the
      // transcript underneath, and the content visibly jumps as the sidebar
      // comes in. preventDefault only works on a listener registered as
      // non-passive, which is why this one is attached by hand.
      if (event.cancelable) event.preventDefault();
      if (dx < OPEN_TRAVEL_PX) return;
      from = null;
      open.current();
    };

    const clear = () => { from = null; axis = null; };

    document.addEventListener("touchstart", onStart, { passive: true });
    document.addEventListener("touchmove", onMove, { passive: false });
    document.addEventListener("touchend", clear, { passive: true });
    document.addEventListener("touchcancel", clear, { passive: true });
    return () => {
      document.removeEventListener("touchstart", onStart);
      document.removeEventListener("touchmove", onMove);
      document.removeEventListener("touchend", clear);
      document.removeEventListener("touchcancel", clear);
    };
  }, [enabled]);
}
