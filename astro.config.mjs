// @ts-check
import node from '@astrojs/node';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig, envField } from 'astro/config';
import Icons from 'unplugin-icons/vite';

// https://astro.build/config
export default defineConfig({
  // Pages render per request. A page that never changes opts out with
  // `export const prerender = true`.
  output: 'server',
  adapter: node({ mode: 'standalone' }),
  integrations: [react()],
  vite: {
    // Material Symbols Rounded, as in the app. Icons compile to React
    // components, which render to plain SVG in .astro files and ship no JS.
    plugins: [tailwindcss(), Icons({ compiler: 'jsx', jsx: 'react' })],
  },
  env: {
    schema: {
      // `secret` keeps the value out of the bundle and reads it at runtime,
      // so one image runs in both stacks. It is not secret in the usual sense.
      API_URL: envField.string({
        context: 'server',
        access: 'secret',
        default: 'http://localhost:8080/v1',
      }),
    },
  },
});
