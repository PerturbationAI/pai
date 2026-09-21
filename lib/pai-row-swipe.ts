"use client";

import { useCallback, useEffect, useId, useRef } from "react";

/**
 * Left-swipe on a session row, to stand in for the hover that a touch screen
 * cannot produce.
 *
 * Upstream reveals a row's rename and delete buttons while the pointer is over
 * the row. With hover suppressed on touch (see `canHover`), a phone needs some
 * other way to reach them, and a left swipe is the gesture that means this on
 * a phone.
 *
 * It drives upstream's own `hovered` state rather than adding a second one:
 * the suite matches `{hovered && !session.transient && (` as source text, so a
 * `hovered || swiped` gate would fail a test that has nothing to do with
 * touch.
 *
 * The row follows the finger while it moves and settles when it lifts. An
 * earlier version only snapped open past a fixed distance, which read as
 * unreliable: with no movement until the threshold there was nothing to say
 * the gesture had been understood, and a gesture that died silently looked
 * the same as one that was never recognised.
 *
 * Which axis the gesture is on is decided once, after the finger has moved far
 * enough to tell, and then held. Deciding it on the first touchmove -- what
 * the earlier version did -- reads a displacement of a few pixels in which
 * vertical noise routinely exceeds the horizontal intent, and killed swipes
 * that were plainly sideways.
 *
 * Only one row is open at a time. Rather than lift that into the list -- which
 * would mean changing the parent and this component's props, in the file
 * upstream edits most -- an opening row announces itself on the document and
 * the others close themselves.
 */

/** Must match `--pai-row-actions-width` in app/pai-overrides.css. */
const ACTIONS_WIDTH_PX = 128;
/** Movement needed before the gesture's axis can be told apart from noise. */
const AXIS_DECISION_PX = 10;
const OPENED_EVENT = "pai-session-row-opened";

export function usePaiRowSwipe({ onOpen, onClose, disabled }: {
  onOpen: () => void;
  onClose: () => void;
  disabled?: boolean;
}) {
  const rowId = useId();
  const open = useRef(false);
  const start = useRef<{ x: number; y: number } | null>(null);
  const axis = useRef<"x" | "y" | null>(null);
  const row = useRef<HTMLElement | null>(null);
  /** Whether the row was already open when this gesture began. */
  const wasOpen = useRef(false);
  const offset = useRef(0);
  const callbacks = useRef({ onOpen, onClose });
  callbacks.current = { onOpen, onClose };

  const paint = useCallback((dragging: boolean) => {
    const el = row.current;
    if (!el) return;
    if (dragging) {
      el.style.setProperty("--pai-row-dx", `${offset.current}px`);
      el.setAttribute("data-pai-dragging", "");
    } else {
      el.removeAttribute("data-pai-dragging");
      el.style.removeProperty("--pai-row-dx");
    }
  }, []);

  const settle = useCallback((shouldOpen: boolean) => {
    offset.current = shouldOpen ? -ACTIONS_WIDTH_PX : 0;
    paint(false);
    if (shouldOpen === open.current) return;
    open.current = shouldOpen;
    if (shouldOpen) callbacks.current.onOpen();
    else callbacks.current.onClose();
  }, [paint]);

  const close = useCallback(() => {
    if (!open.current) return;
    settle(false);
  }, [settle]);

  useEffect(() => {
    const onOtherOpened = (event: Event) => {
      if ((event as CustomEvent<string>).detail !== rowId) close();
    };
    // Scrolling the list is the reader moving on, and a row left open under a
    // finger that is now somewhere else invites deleting the wrong session.
    // Captured, because the list scrolls in a container rather than the window.
    //
    // Not while this row is the one being swiped, though. A thumb travelling
    // sideways also drifts down, and once the list is short enough to scroll
    // -- which it becomes as soon as the file explorer is open -- that drift
    // scrolls it. Closing on that scroll shut the row halfway through the
    // gesture that was opening it, which is the whole of the unreliability
    // this guard removes.
    const onScroll = () => { if (axis.current !== "x") close(); };
    document.addEventListener(OPENED_EVENT, onOtherOpened);
    window.addEventListener("scroll", onScroll, { capture: true, passive: true });
    return () => {
      document.removeEventListener(OPENED_EVENT, onOtherOpened);
      window.removeEventListener("scroll", onScroll, { capture: true });
    };
  }, [rowId, close]);

  const listener = useRef<((event: TouchEvent) => void) | null>(null);

  const detach = useCallback(() => {
    if (listener.current && row.current) {
      row.current.removeEventListener("touchmove", listener.current);
    }
    listener.current = null;
  }, []);

  const onTouchStart = useCallback((event: React.TouchEvent<HTMLElement>) => {
    detach();
    axis.current = null;
    row.current = event.currentTarget;
    wasOpen.current = open.current;
    start.current = disabled || event.touches.length !== 1
      ? null
      : { x: event.touches[0].clientX, y: event.touches[0].clientY };
    if (!start.current) return;
    listener.current = (e: TouchEvent) => onNativeTouchMove.current(e);
    row.current.addEventListener("touchmove", listener.current, { passive: false });
  }, [disabled, detach]);

  // Attached per gesture, and deliberately not through React: React registers
  // touchmove at the root as passive, so preventDefault() there does nothing.
  // Without it iOS starts scrolling the list as soon as the thumb drifts down,
  // then sends touchcancel, and the half-finished swipe settles shut. The list
  // only became scrollable enough for that to bite once the file explorer was
  // open, which is why it looked intermittent.
  const onNativeTouchMove = useRef<(event: TouchEvent) => void>(() => {});
  onNativeTouchMove.current = (event: TouchEvent) => {
    const from = start.current;
    if (!from || event.touches.length !== 1) return;
    const dx = event.touches[0].clientX - from.x;
    const dy = event.touches[0].clientY - from.y;

    if (axis.current === null) {
      if (Math.hypot(dx, dy) < AXIS_DECISION_PX) return;
      axis.current = Math.abs(dx) > Math.abs(dy) ? "x" : "y";
      if (axis.current === "x" && !open.current) {
        // Mount the panel now, so the row uncovers it as the finger moves
        // rather than sliding over nothing until it is released.
        open.current = true;
        callbacks.current.onOpen();
        document.dispatchEvent(new CustomEvent(OPENED_EVENT, { detail: rowId }));
      }
    }
    if (axis.current === "y") return;

    event.preventDefault();
    const base = wasOpen.current ? -ACTIONS_WIDTH_PX : 0;
    offset.current = Math.max(-ACTIONS_WIDTH_PX, Math.min(0, base + dx));
    paint(true);
  };

  const onTouchEnd = useCallback(() => {
    detach();
    start.current = null;
    if (axis.current !== "x") { axis.current = null; return; }
    axis.current = null;
    settle(offset.current <= -ACTIONS_WIDTH_PX / 2);
  }, [settle, detach]);

  return { onTouchStart, onTouchEnd, onTouchCancel: onTouchEnd };
}
