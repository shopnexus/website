import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';
import { RI } from './icon-map.mjs';

/**
 * Icons for <Icon name="…">, by name at render time. Names are Material
 * Symbols names ('chat-outline-rounded'); each one in icon-map.mjs draws its
 * Remix Icon glyph, and a name not in the map falls back to Material Symbols.
 * The build ships only the names that appear in src/ as a quoted string,
 * plus each one's filled form without "-outline", which a selected item
 * switches to (Remix "-fill").
 *
 * import icons from 'virtual:icons' gives { name: { body, width, height } }.
 */
export default function iconSubset({ root = 'src' } = {}) {
  const id = 'virtual:icons';
  const resolved = '\0' + id;
  const require = createRequire(import.meta.url);
  const set = require('@iconify-json/material-symbols/icons.json');
  const ri = require('@iconify-json/ri/icons.json');
  const files = (/** @type {string} */ dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? files(join(dir, e.name)) : /\.(astro|tsx?|mjs)$/.test(e.name) ? [join(dir, e.name)] : [],
    );
  const from = (/** @type {any} */ pack, /** @type {string} */ name) => {
    const alias = pack.aliases?.[name];
    const icon = pack.icons[alias ? alias.parent : name];
    return icon && { body: icon.body, width: icon.width ?? pack.width ?? 24, height: icon.height ?? pack.height ?? 24 };
  };
  /** @type {Record<string, string>} */
  const map = RI;
  // A filled form ('favorite-rounded' from 'favorite-outline-rounded') takes
  // its outline's Remix glyph in "-fill" unless the map names it itself.
  const remix = (/** @type {string} */ name) => {
    if (map[name]) return map[name];
    const outline = Object.keys(map).find((k) => k.replace('-outline', '') === name);
    return outline && map[outline].replace(/-line$/, '-fill');
  };
  const lookup = (/** @type {string} */ name) => {
    const r = remix(name);
    return (r && from(ri, r)) || from(set, name);
  };
  return {
    name: 'shopnexus-icons',
    resolveId: (/** @type {string} */ s) => (s === id ? resolved : undefined),
    load(/** @type {string} */ s) {
      if (s !== resolved) return;
      const out = {};
      for (const f of files(root)) {
        this.addWatchFile(f);
        for (const [, name] of readFileSync(f, 'utf8').matchAll(/['"`]([a-z0-9]+(?:-[a-z0-9]+)+)['"`]/g)) {
          for (const n of [name, name.replace('-outline', '')]) {
            const icon = lookup(n);
            if (icon) out[n] = icon;
          }
        }
      }
      return `export default ${JSON.stringify(out)};`;
    },
    handleHotUpdate(/** @type {any} */ ctx) {
      if (!/\.(astro|tsx?|mjs)$/.test(ctx.file)) return;
      const mod = ctx.server.moduleGraph.getModuleById(resolved);
      if (mod) ctx.server.moduleGraph.invalidateModule(mod);
    },
  };
}
