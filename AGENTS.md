## Development

When starting the dev server, use background mode:

```
astro dev --background
```

Manage the background server with `astro dev stop`, `astro dev status`, and `astro dev logs`.

## Documentation

Full documentation: https://docs.astro.build

Consult these guides before working on related tasks:

- [Adding pages, dynamic routes, or middleware](https://docs.astro.build/en/guides/routing/)
- [Working with Astro components](https://docs.astro.build/en/basics/astro-components/)
- [Using React, Vue, Svelte, or other framework components](https://docs.astro.build/en/guides/framework-components/)
- [Adding or managing content](https://docs.astro.build/en/guides/content-collections/)
- [Adding styles or using Tailwind](https://docs.astro.build/en/guides/styling/)
- [Supporting multiple languages](https://docs.astro.build/en/guides/internationalization/)

## Design

Read `DESIGN.md` before building UI. Use only the utilities from `src/styles/tokens.css` and `src/styles/j.css`; Tailwind's default colours, type steps, radii and breakpoints are switched off. The Android app's `app/.superdesign/design-system.md` is the reference for anything `DESIGN.md` leaves out.

ShopNexus holds no money: the only deal path is cash on delivery with inspection at the door. No page may mention escrow, a wallet, or a refund from the platform.

## Astro audit

After a UI change, run the rules of the dev toolbar's Audit app and fix what they flag. `~/shopnexus/tmp/astro-audit/run.mjs <checkout>` runs them on every route, signed out and signed in, at 1280×800 and 390×844, against `astro dev --port 4391`. It groups the hits by source line. Every rule counts, `a11y-invalid-href` included: the site has no mock `#` links left.

- Images use `src/components/Photo.astro`, a wrapper around Astro's `Image` that loads eagerly unless the caller passes `loading="lazy"`.
- A list component takes a `loading` prop. The caller passes `lazy` from the row where the list leaves the first screen at both sizes.
- The 1280×800 run has no hits. At 390×844, `perf-use-loading-lazy` may flag a photo that is in the first screen on desktop and below it on a phone.
- A `label` wraps a real `input`, `select` or `textarea`. Radios are `input type="radio"`, menu items are `button`, and no field has `autofocus`.
