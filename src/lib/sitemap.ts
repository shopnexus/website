// Sitemap XML (sitemaps.org 0.9). Addresses are absolute on the host that
// serves the request, so the dev cluster and production list their own.

export interface SitemapEntry {
  /** A path on this site. */
  path: string;
  /** ISO time of the last change. */
  lastmod?: string;
}

/** The two lists a sitemap part holds: GET /v1/sitemap/listings and /v1/sitemap/sellers. */
export const PART_KINDS = ['listings', 'sellers'] as const;
export type PartKind = (typeof PART_KINDS)[number];

/** A part's file; the first part has no cursor. */
export const partPath = (kind: PartKind, cursor?: string) => `/sitemaps/${kind}/${cursor ?? 'first'}.xml`;

const NS = 'http://www.sitemaps.org/schemas/sitemap/0.9';
const escape = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&apos;');
const items = (tag: string, entries: SitemapEntry[], origin: URL) =>
  entries
    .map((e) => `<${tag}><loc>${escape(new URL(e.path, origin).href)}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</${tag}>`)
    .join('\n');

const xml = (root: string, tag: string, entries: SitemapEntry[], origin: URL) =>
  new Response(`<?xml version="1.0" encoding="UTF-8"?>\n<${root} xmlns="${NS}">\n${items(tag, entries, origin)}\n</${root}>\n`, {
    headers: { 'content-type': 'application/xml; charset=utf-8', 'cache-control': 'public, max-age=3600' },
  });

/** A sitemap: the pages at `entries`. */
export const urlset = (entries: SitemapEntry[], origin: URL) => xml('urlset', 'url', entries, origin);

/** A sitemap index: the sitemap files at `entries`. */
export const sitemapIndex = (entries: SitemapEntry[], origin: URL) => xml('sitemapindex', 'sitemap', entries, origin);
