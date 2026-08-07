---
name: nextjs-senior-dev
description: Senior-level Next.js development conventions and architectural guidance — App Router structure, rendering strategy (SSR/SSG/ISR/RSC), data fetching, caching, server actions, routing patterns, performance, and project layout. Use whenever writing, reviewing, or architecting Next.js code, components, routes, or API handlers, or when the user asks for Next.js best practices.
---

# Senior Next.js Developer Guide

Assumes Next.js 14+ App Router unless the user's codebase indicates Pages Router — check for `app/` vs `pages/` directory first and match the existing convention rather than forcing App Router onto a Pages Router project.

## Rendering Strategy
- Default to Server Components; only add `"use client"` when you need interactivity, browser APIs, hooks (`useState`, `useEffect`), or event listeners
- Push `"use client"` as far down the tree as possible — wrap the smallest interactive leaf, not the whole page
- Choose per-route: static (`generateStaticParams`) for content that rarely changes, ISR (`revalidate`) for periodically-updated content, dynamic (`fetch cache: 'no-store'` or `dynamic = 'force-dynamic'`) only when truly per-request

## Data Fetching
- Fetch data directly in Server Components with `async/await` — no `useEffect` + `fetch` waterfalls for initial data
- Colocate fetches near where data is used; Next.js dedupes identical fetches automatically within a render
- Use `Promise.all` for independent parallel fetches; avoid sequential `await` chains unless there's a true dependency
- Server Actions for mutations — colocate in the file that uses them, or in `actions.ts` per feature folder; always validate input server-side (never trust client-side validation alone)

## Caching
- Understand the four cache layers: Request Memoization, Data Cache, Full Route Cache, Router Cache
- Be explicit: `fetch(url, { cache: 'force-cache' | 'no-store', next: { revalidate: N, tags: [...] } })`
- Use `revalidateTag` / `revalidatePath` after mutations rather than blanket `revalidate: 0`
- Don't fight the cache with `Math.random()` or `Date.now()` hacks — use proper revalidation

## Routing & File Conventions
- Route groups `(group)` for organization without affecting URL structure
- Parallel routes `@slot` and intercepting routes `(.)folder` for modals/dashboards — reach for these before hand-rolling modal state
- `loading.tsx` and `error.tsx` per route segment, not just at root
- Colocate route-specific components in the route folder (`_components/`); shared components live in a top-level `components/`

## Project Structure
```
app/
  (marketing)/
    page.tsx
    layout.tsx
  (dashboard)/
    dashboard/
      page.tsx
      loading.tsx
      error.tsx
      _components/
      actions.ts
  api/
    webhooks/route.ts
components/          # shared, reusable across routes
lib/
  db.ts
  auth.ts
  utils.ts
types/
```

## Performance
- `next/image` always for images — specify `sizes`, use `priority` only for above-the-fold LCP images
- `next/font` for font loading, never manual `<link>` to Google Fonts
- Dynamic import (`next/dynamic`) for heavy client components not needed on initial paint
- Avoid large client bundles: check `next build` output, watch for accidentally-bundled server-only deps in client components
- Streaming with `<Suspense>` boundaries around slow data fetches instead of blocking the whole page

## Server Actions & Mutations
- Mark with `"use server"` at the top of the file or function
- Return typed results (`{ success: boolean; error?: string; data?: T }`), don't throw for expected validation failures
- Use `useFormStatus` / `useActionState` (React 19) for pending/error UI, not manual `isLoading` state plumbing where avoidable

## API Routes
- Use Route Handlers (`route.ts`) only for things Server Actions can't do: webhooks, third-party callbacks, non-form API consumers
- Prefer Server Actions over API routes for internal form submissions from your own app

## Environment & Config
- `NEXT_PUBLIC_` prefix only for values that must reach the client — never leak secrets this way
- Validate env vars at startup (e.g. with `zod`) rather than discovering missing vars at runtime
- `next.config.js`: keep `experimental` flags documented with a comment on why each is needed

## Error Handling
- `error.tsx` boundaries per segment for graceful degradation
- `notFound()` for 404s instead of manually rendering a "not found" UI inline
- Log server errors with context (route, user, input) before returning a generic message to the client

## TypeScript
- Type `params` and `searchParams` explicitly in page/layout components
- Generate types from your data layer (Prisma, Drizzle, or your ORM) rather than hand-writing duplicate interfaces
- Use `satisfies` for config objects (`next.config.js`, route metadata) to keep inference without losing literal types

## Testing
- Unit/component tests: Vitest or Jest + React Testing Library for client components and pure functions
- E2E: Playwright for critical user flows (auth, checkout, core CRUD)
- Test Server Actions as plain async functions — no special mocking needed if they're pure enough

## Common Anti-Patterns to Flag
- `"use client"` at the top of large pages "just in case"
- `useEffect` for data fetching that could be a Server Component fetch
- Fetching in a client component when the data is static/server-known at request time
- Not using `loading.tsx`, causing full-page blank states during navigation
- Mixing Pages Router and App Router patterns in the same feature
- Storing secrets or DB clients in files reachable from client components
