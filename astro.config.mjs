// @ts-check
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField } from 'astro/config';
import Icons from 'unplugin-icons/vite';
import iconSubset from './src/build/icons.mjs';

// https://astro.build/config
export default defineConfig({
  // Pages render per request. A page that never changes opts out with
  // `export const prerender = true`.
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  // Hosts Astro.url may take from the request. Without them it is localhost,
  // and the chat socket's address with it.
  security: {
    allowedDomains: [{ hostname: 'shopnexus.id.vn' }, { hostname: '*.shopnexus.id.vn' }, { hostname: 'shopnexus.localhost' }],
  },
  integrations: [react()],
  vite: {
    // The mascot art, favicon and app icons live in the brand submodule
    // (shopnexus/brand), shared with the Android app: import '@brand/art_deal.webp'.
    resolve: { alias: { '@brand': decodeURIComponent(new URL('./brand/web', import.meta.url).pathname) } },
    // Icons are Remix Icon, named the Material Symbols way as in the app
    // (src/build/icon-map.mjs). .astro files use <Icon name>, which reads the
    // subset src/build/icons.mjs builds.
    plugins: [tailwindcss(), Icons({ compiler: 'jsx', jsx: 'react' }), iconSubset()],
  },
  env: {
    schema: {
      // `secret` keeps the value out of the bundle and reads it at runtime,
      // so one image runs in both stacks. It is not secret in the usual sense.
      API_URL: envField.string({
        context: 'server',
        access: 'secret',
        default: 'http://localhost:8080',
      }),
      // The API's address as a browser reaches it, for the socket. Unset, it is
      // api.<the site's host>; a dev server on localhost sets it.
      PUBLIC_API_URL: envField.string({ context: 'server', access: 'secret', optional: true }),
      // The Firebase project's Web Push certificate (public key). Unset, the
      // site offers no browser notifications.
      PUBLIC_FCM_VAPID_KEY: envField.string({ context: 'server', access: 'secret', optional: true }),
    },
  },
});
