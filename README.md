# ShopNexus website

The public storefront for ShopNexus, a C2C marketplace for used goods in Vietnam. It is an Astro site rendered on the server by the Node adapter, with React for the parts of a page that react to the buyer. Data comes from the Go server in the `server` repository.

The earlier Next.js site, built for the escrow model, is on the `escrow` branch.

## Development

```
git submodule update --init
bun install
cp .env.example .env
bun run dev
```

`brand/` is the `shopnexus/brand` submodule, shared with the Android app. It
holds the mascot art, the favicon and the app icons; pages import them as
`@brand/<name>`, for example `@brand/art_deal.webp`.

`API_URL` is the Go server's origin and defaults to `http://localhost:8080`. Astro reads it at runtime, so one image runs in the dev and prod stacks. Pages call the server through `src/lib/api/client.ts`, typed from `src/lib/api/schema.d.ts`. After the server's `api/` changes, `bun run api` writes that file again from `../server/api`, and `bun run api:check` fails while it is out of date.

The buyer's access and refresh tokens are httpOnly cookies. `src/middleware.ts` refreshes the access token when its cookie has expired, and the browser never reads either token.

`bun run check` type-checks the project and `bun run build` writes the server to `dist/`.

## Design

`DESIGN.md` lists what the website takes from the Android app's design system and what it changes for the web. The tokens are in `src/styles/tokens.css`.

## Image

The Dockerfile builds with Bun and runs `node dist/server/entry.mjs` on port 3000. A push to `main` builds `ghcr.io/shopnexus/website:main`, and a `v*` tag builds a semver tag; Argo CD Image Updater in the umbrella repository deploys them.
