import { readFile } from 'node:fs/promises';
import { createRequire } from 'node:module';
import mark from '@brand/brand_mark.svg?raw';
import satori from 'satori';
import sharp from 'sharp';
import type { Schemas } from './api/client';
import { group } from './format';
import { conditionLabel } from './listing';
import { SHARE_IMAGE } from './seo';

// A listing's share picture (og:image), 1200 × 630, as drawn in the
// Superdesign draft "Ảnh chia sẻ tin · A ảnh trái": the first photo on the
// left, the condition, title, price and place beside it.

const PHOTO = 574;
// The site's light colours (j.css): page, ink, sub, mint, on-mint.
const C = { page: '#f7f7f5', ink: '#1a1a19', sub: '#5e5e5a', soft: '#ecece9', mint: '#e3f2ef', onMint: '#05554e' };
const LOGO = `data:image/svg+xml;base64,${Buffer.from(mark).toString('base64')}`;
const PIN = `data:image/svg+xml;base64,${Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="${C.sub}"><path d="M12 2a8 8 0 0 0-8 8c0 5.4 7 11.5 7.3 11.8a1 1 0 0 0 1.4 0C13 21.5 20 15.4 20 10a8 8 0 0 0-8-8zm0 11a3 3 0 1 1 0-6 3 3 0 0 1 0 6z"/></svg>`,
).toString('base64')}`;

// Be Vietnam Pro from @fontsource, read once per process. Its files split the
// glyphs by subset; each is a family of its own and the card lists all three.
const require = createRequire(import.meta.url);
const SUBSETS = ['latin', 'latin-ext', 'vietnamese'];
const FAMILY = SUBSETS.map((s) => `Be Vietnam Pro ${s}`).join(', ');
let fonts: ReturnType<typeof loadFonts> | undefined;
const fontsOnce = () =>
  (fonts ??= loadFonts().catch((e) => {
    fonts = undefined;
    throw e;
  }));
function loadFonts() {
  const weights = [500, 600, 700] as const;
  return Promise.all(
    weights.flatMap((weight) =>
      SUBSETS.map(async (subset) => ({
        name: `Be Vietnam Pro ${subset}`,
        weight,
        style: 'normal' as const,
        data: await readFile(require.resolve(`@fontsource/be-vietnam-pro/files/be-vietnam-pro-${subset}-${weight}-normal.woff`)),
      })),
    ),
  );
}

/** The photo cropped to the card's square as a data URI, or null when it cannot be read. */
async function photo(url: string | undefined) {
  if (!url) return null;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const jpeg = await sharp(Buffer.from(await res.arrayBuffer()))
      .resize(PHOTO, PHOTO, { fit: 'cover' })
      .jpeg({ quality: 82 })
      .toBuffer();
    return `data:image/jpeg;base64,${jpeg.toString('base64')}`;
  } catch {
    return null;
  }
}

/** The PNG of a public listing's share picture. */
export async function listingCard(it: Schemas['Listing']): Promise<Buffer> {
  const [loaded, cover] = await Promise.all([fontsOnce(), photo(it.photos.find((p) => p.url)?.url)]);
  const box = { width: PHOTO, height: PHOTO, borderRadius: 28 };
  const price = group(it.price);
  // Nine characters (9.999.999) fit at full size; a longer price steps down.
  const priceSize = Math.max(60, 84 - Math.max(0, price.length - 9) * 8);
  const svg = await satori(
    <div style={{ display: 'flex', ...SHARE_IMAGE, background: C.page, padding: 28, gap: 44, fontFamily: FAMILY }}>
      {cover ? <img src={cover} style={{ ...box, objectFit: 'cover' }} /> : <div style={{ ...box, background: C.soft }} />}
      <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0, height: PHOTO, padding: '12px 24px 12px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
          <img src={LOGO} width={44} height={44} />
          <span style={{ fontSize: 26, fontWeight: 600, color: C.ink, letterSpacing: '-0.01em' }}>ShopNexus</span>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 18, marginTop: 'auto' }}>
          <span style={{ alignSelf: 'flex-start', borderRadius: 10, background: C.mint, color: C.onMint, padding: '6px 14px', fontSize: 24, fontWeight: 500 }}>
            {conditionLabel(it.condition)}
          </span>
          <div style={{ display: 'block', lineClamp: 3, fontSize: 40, lineHeight: '52px', fontWeight: 600, color: C.ink }}>{it.title}</div>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, color: C.ink }}>
            <span style={{ fontSize: priceSize, fontWeight: 700, letterSpacing: '-0.03em' }}>{price}</span>
            <span style={{ fontSize: priceSize / 2, fontWeight: 600, color: C.sub }}>₫</span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 28, fontSize: 24, color: C.sub }}>
          <img src={PIN} width={26} height={26} />
          <span style={{ display: 'block', lineClamp: 1 }}>
            {it.location.commune.display_name}, {it.location.province.display_name}
          </span>
        </div>
      </div>
    </div>,
    { ...SHARE_IMAGE, fonts: loaded },
  );
  return sharp(Buffer.from(svg)).png().toBuffer();
}
