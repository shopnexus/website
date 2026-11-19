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

Đăng nhập takes a code mailed to an email address, a Google account or a phone number. The email steps are form posts and work without JavaScript. Google and the phone use Firebase Authentication in the browser (`src/lib/firebase.ts`): the page gets a Google ID token, or Firebase's ID token after the texted code, and posts it to the site, which signs in with the Go server and keeps the server's tokens. The Firebase client keeps its state in memory and signs out after each proof. The SDK loads only on Đăng nhập and Bảo mật: as the page opens where it shows the Google button, which stays disabled until then so Google's popup opens inside the click, and otherwise when a code is first sent. A Firebase token goes to the server in the request that posts it and is never kept in a cookie. Each domain the site runs on must be in the Firebase project's authorized domains.

`bun run check` type-checks the project and `bun run build` writes the server to `dist/`.

## Design

`DESIGN.md` lists what the website takes from the Android app's design system and what it changes for the web. The tokens are in `src/styles/tokens.css`.

## Image

The Dockerfile builds with Bun and runs `node dist/server/entry.mjs` on port 3000. A push to `main` builds `ghcr.io/shopnexus/website:main`, and a `v*` tag builds a semver tag; Argo CD Image Updater in the umbrella repository deploys them.
