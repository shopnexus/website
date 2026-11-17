import { readFileSync, readdirSync } from 'node:fs';
import { createRequire } from 'node:module';
import { join } from 'node:path';

/**
 * Material Symbols for <Icon name="…">, by name at render time. The set has
 * 15 000 icons (8 MB of JSON), so the build ships only the names that appear
 * in src/ as a quoted string ('chat-outline-rounded'), plus each one's filled
 * form without "-outline", which a selected item switches to.
 *
 * import icons from 'virtual:icons' gives { name: { body, width, height } }.
 */
export default function iconSubset({ root = 'src' } = {}) {
  const id = 'virtual:icons';
  const resolved = '\0' + id;
  const set = createRequire(import.meta.url)('@iconify-json/material-symbols/icons.json');
  const files = (/** @type {string} */ dir) =>
    readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
      e.isDirectory() ? files(join(dir, e.name)) : /\.(astro|tsx?|mjs)$/.test(e.name) ? [join(dir, e.name)] : [],
    );
  const lookup = (/** @type {string} */ name) => {
    const alias = set.aliases?.[name];
    const icon = set.icons[alias ? alias.parent : name];
    return icon && { body: icon.body, width: icon.width ?? set.width ?? 24, height: icon.height ?? set.height ?? 24 };
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
