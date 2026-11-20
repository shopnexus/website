import icon192 from '@brand/icon-192.png';
import icon512 from '@brand/icon-512.png';
import type { APIRoute } from 'astro';
import maskable from '../assets/pwa/maskable-512.png';
import { BAR_COLOR } from '../lib/theme';

// The web app manifest (AppHead.astro links it): ShopNexus installs as an app
// that opens Home in a window of its own. Built once.
export const prerender = true;

export const GET: APIRoute = () =>
  new Response(
    JSON.stringify({
      id: '/',
      name: 'ShopNexus',
      short_name: 'ShopNexus',
      description: 'Đồ cũ giá tốt, xem hàng rồi mới trả.',
      lang: 'vi',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      background_color: BAR_COLOR.light,
      theme_color: BAR_COLOR.light,
      categories: ['shopping'],
      icons: [
        { src: icon192.src, sizes: '192x192', type: 'image/png' },
        { src: icon512.src, sizes: '512x512', type: 'image/png' },
        { src: maskable.src, sizes: '512x512', type: 'image/png', purpose: 'maskable' },
      ],
    }),
    { headers: { 'content-type': 'application/manifest+json' } },
  );
