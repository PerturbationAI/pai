/**
 * The glyph carries the state: a brain while the block is done, an exploding
 * head while the turn is still writing into it.
 *
 * Emoji bring their own colour, so the amber tint and glow the drawn icon used
 * are not available here — the glyph itself is the only signal, which is why it
 * changes shape rather than shade.
 */
export function ThinkingIcon({ thinking, size = 14 }: { thinking: boolean; size?: number }) {
  return (
    <span
      aria-hidden="true"
      style={{
        flexShrink: 0,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        width: size,
        height: size,
        fontSize: size * 0.95,
        lineHeight: 1,
        fontFamily: '"Apple Color Emoji", "Segoe UI Emoji", "Noto Color Emoji", sans-serif',
      }}
    >
      {thinking ? "\u{1F92F}" : "\u{1F9E0}"}
    </span>
  );
}
