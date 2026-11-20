// Where a page can be shared from, and the share address each place takes.
// The web links work anywhere; on a phone a few open the app instead.
import type { MARKS } from "./share-marks";

export type Brand = keyof typeof MARKS;

export interface Target {
  key: Brand | "email";
  label: string;
  href: string;
  /** Shown on a phone only: Messenger has no web share without an app id. */
  phone?: boolean;
}

const enc = encodeURIComponent;

/** url: the page's canonical address; text: what the message says above it. */
export function targets(url: string, text: string): Target[] {
  const u = enc(url);
  return [
    { key: "zalo", label: "Zalo", href: `https://zalo.me/share?url=${u}` },
    {
      key: "facebook",
      label: "Facebook",
      href: `https://www.facebook.com/sharer/sharer.php?u=${u}`,
    },
    {
      key: "messenger",
      label: "Messenger",
      href: `fb-messenger://share/?link=${u}`,
      phone: true,
    },
    {
      key: "telegram",
      label: "Telegram",
      href: `https://t.me/share/url?url=${u}&text=${enc(text)}`,
    },
    {
      key: "x",
      label: "X",
      href: `https://x.com/intent/post?url=${u}&text=${enc(text)}`,
    },
    {
      key: "email",
      label: "Email",
      href: `mailto:?subject=${enc(text)}&body=${enc(`${text}\n${url}`)}`,
    },
  ];
}

export type Platform = "android" | "ios" | null;

/** The phone's system, or null on a computer. */
export function platform(ua = navigator.userAgent): Platform {
  if (/Android/i.test(ua)) return "android";
  if (
    /iPhone|iPad|iPod/i.test(ua) ||
    (/Macintosh/.test(ua) && navigator.maxTouchPoints > 1)
  )
    return "ios";
  return null;
}

/** Zalo's own app links, as its share SDK opens them; Android falls back to the web. */
export function zaloApp(url: string, on: Exclude<Platform, null>) {
  const u = enc(url);
  if (on === "ios") return `zaloshareext://shareext?url=${u}&type=8&version=1`;
  const web = enc(`https://zalo.me/share?url=${u}`);
  return `intent://zaloapp.com/#Intent;action=android.intent.action.SEND;type=text/plain;S.android.intent.extra.TEXT=${u};B.hidePostFeed=false;B.backToSource=true;S.browser_fallback_url=${web};end`;
}
