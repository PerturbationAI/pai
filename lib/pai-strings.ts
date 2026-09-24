/**
 * Strings for PAI's own controls.
 *
 * These deliberately do not go into `lib/i18n/messages/*`. Those three files
 * are the most-edited in the repository — 42, 43 and 25 changes in the month
 * before v0.9.1 — so a key added there conflicts on nearly every upstream
 * release. Keeping PAI's strings in a file upstream does not have costs one
 * lookup and removes that entirely.
 *
 * The locale still comes from upstream's `useI18n()`, so these follow the
 * language the user picked like every other string does.
 */

const STRINGS = {
  jumpToLatest: {
    "en": "Jump to the latest message",
    "zh-CN": "回到最新消息",
    "zh-TW": "回到最新訊息",
  },
  updateAvailable: {
    "en": "A new version is available",
    "zh-CN": "有新版本",
    "zh-TW": "有新版本",
  },
  dismiss: {
    "en": "Dismiss",
    "zh-CN": "忽略",
    "zh-TW": "忽略",
  },
  reloadNow: {
    "en": "Reload",
    "zh-CN": "点击刷新",
    "zh-TW": "點擊重新整理",
  },
  /**
   * Upstream's own placeholder names the two shortcuts -- "Message… Type /
   * for commands, @ for files" -- which measures 281px against the 265 a
   * phone's text line has, so it was always being cut mid-phrase. The
   * shortcuts still work; the line that announced them does not fit, and a
   * hint that is cut off announces nothing. Only the phone uses this.
   */
  composerPlaceholder: {
    "en": "Message…",
    "zh-CN": "发消息…",
    "zh-TW": "傳訊息…",
  },
} as const;

export type PaiStringKey = keyof typeof STRINGS;

export function paiText(locale: string, key: PaiStringKey): string {
  const entry: Record<string, string> = STRINGS[key];
  return entry[locale] ?? entry.en;
}
