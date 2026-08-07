---
name: frontend-design-clean-code
description: Use this skill whenever writing, generating, reviewing, or refactoring Next.js/React frontend code, OR when designing/reshaping UI visuals. Combines two responsibilities — (1) distinctive, intentional visual design (palette, typography, layout, motion) instead of templated defaults, and (2) clean code architecture that separates components, hooks, business logic, types, and utils into their own files instead of dumping everything into one giant file. Trigger this whenever the user asks to build a page, feature, form, component, redesign a UI, or fix "messy"/"dirty"/templated-looking code — even if they don't explicitly mention design or clean code.
---

# Frontend Design + Clean Code (Next.js)

This skill governs two things at once whenever frontend UI work happens: **how it looks** and **how it's structured**. Every generated feature must be both visually deliberate and architecturally clean — one without the other is an incomplete job.

---

## Part 1 — Visual Design

Approach this as the design lead at a small studio known for giving every client a visual identity that could not be mistaken for anyone else's. Make deliberate, opinionated choices about palette, typography, and layout that are specific to this brief, and take one real aesthetic risk you can justify.

### Ground it in the subject

If the brief does not pin down what the product or subject is, pin it yourself before designing: name one concrete subject, its audience, and the page's single job, and state your choice. If there's any information in memory about the user's preferences, prior context, or past designs, use it as a hint. Build with the brief's real content and subject matter throughout — the subject's own world, materials, and vernacular is where distinctive choices come from.

### Design principles

- **The hero is a thesis.** Open with the most characteristic thing in the subject's world — a headline, an image, an animation, a live demo, an interactive moment. Don't default to "big number + small label + gradient accent" unless it's genuinely the best option.
- **Typography carries the personality.** Pair display and body faces deliberately, not the defaults you'd reach for on any project. Set a clear type scale with intentional weights and spacing.
- **Structure is information.** Numbering, eyebrows, dividers, labels should encode something true about the content, not decorate it. Only use numbered markers (01/02/03) if the content is genuinely sequential.
- **Motion is deliberate, not decorative.** Consider a page-load sequence, scroll reveal, hover micro-interaction, or ambient atmosphere — but only where it serves the subject. Excess animation reads as AI-generated.
- **Match complexity to the vision.** Maximalist directions need elaborate execution; minimal directions need precision in spacing and detail.
- **Copy is design material.** Write from the end user's side of the screen, name things by what people control/recognize (not implementation details), use active voice, keep the same verb through a whole flow (button says "Publish" → toast says "Published"). Errors state what happened and how to fix it, without apologizing or vagueness.

### Avoid AI-generated defaults

Watch for these three clusters that AI design currently gravitates to regardless of subject:
1. Warm cream background (~#F4F1EA) + high-contrast serif + terracotta/clay accent (~#D97757)
2. Near-black background + single acid-green or vermilion accent
3. Broadsheet layout: hairline rules, zero border-radius, dense newspaper columns

These are legitimate only when the brief actually calls for them. If the brief leaves an axis free, don't spend that freedom on one of these defaults.

### Process: plan → critique → build → critique again

1. **Brainstorm a compact token system** before writing any code:
   - **Color**: 4-6 named hex values
   - **Type**: 2+ typefaces (a characterful display face used with restraint, a complementary body face, optionally a utility face for captions/data)
   - **Layout**: one-sentence layout concept + ASCII wireframe
   - **Signature**: the one unique element this page will be remembered by
2. **Review the plan against the brief** — if any part reads like a generic default rather than a choice made for this specific brief, revise it and note what changed and why.
3. **Only then write code**, deriving every color/type decision from the reviewed plan. Watch CSS selector specificity so classes don't silently cancel each other (common with `.section` vs element selectors on padding/margin).
4. **Spend boldness in one place** — keep everything around the signature element quiet and disciplined. Build to a quality floor without announcing it: responsive to mobile, visible keyboard focus, reduced motion respected.

---

## Part 2 — Clean Code Architecture

Goal: every time frontend code is generated or edited, ALWAYS split it by role (component / hook / logic / type / util) — never dump everything into one "God Component" file. A beautifully designed component that mixes UI, fetching, and business logic in one file is still a failed deliverable.

### Mandatory principles

1. **Components only handle UI (render + JSX).** Never write business logic, data fetching, or complex calculations directly inside a component.
2. **Business logic → its own file.** Pure functions with no React dependency go in `*.logic.ts`, `lib/`, or `services/`.
3. **Reusable state/side-effects → a custom hook** (`use*.ts`) under `hooks/`. A hook can stay inline only if trivial (1-2 lines of state); anything with more than one side-effect or non-trivial conditional logic must be extracted.
4. **Shared types/interfaces → a dedicated `types.ts`** file, never redefined across multiple components.
5. **Constants and pure helpers** (formatting, validation, calculations) → `utils/`, never inline inside a component.
6. **API calls / data fetching → their own function** (`api/`, `services/`, or a dedicated data-fetching hook). Components call a hook, never `fetch`/`axios` directly inside a JSX handler.
7. **One file = one responsibility.** If a file mixes UI + logic + fetching + types, split it immediately, even for small features.
8. **Soft size limit:** a component over ~150-200 lines, or with more than 2 unrelated `useEffect`s, needs splitting.

### Suggested folder structure (flexible per project)

Don't force feature-based or type-based structure — follow the project's existing conventions. For a new project or one without a clear convention, default to feature-based folders (scales well with the Next.js App Router):

```
app/
  (feature)/
    page.tsx                # import + render only, as little logic as possible
    components/
      FeatureForm.tsx        # pure UI
      FeatureList.tsx
    hooks/
      useFeatureData.ts       # side-effects, state
    lib/
      feature.logic.ts        # pure business logic, easy to unit test
      feature.api.ts           # API/service calls
    types.ts
```

If the project already uses top-level shared folders (`components/`, `hooks/`, `utils/`) instead of feature folders, follow that instead — don't change the project's architecture unilaterally.

### Workflow when generating new code

1. Identify the roles needed (UI, state/hook, business logic, API call, types) before writing anything.
2. Write each file separately by role from the start — never "write it all in one file, refactor later."
3. Clear imports between files. Naming: `PascalCase.tsx` components, `useCamelCase.ts` hooks, `camelCase.ts` logic/utils.
4. Self-review after writing: does each file have exactly one responsibility?

### Workflow when reviewing/refactoring dirty code

1. List the responsibility clusters mixed together in the file (e.g., JSX + 3 fetching `useEffect`s + a validator + type defs).
2. Extract each cluster into the right file per the principles above, preserving behavior exactly.
3. The original component ends up containing only: hook/logic imports + JSX.
4. Check for circular dependencies between hooks and logic files.
5. Report back briefly which files were split out and why.

### Common mistakes to avoid

- `useEffect` calling an API directly instead of a dedicated hook.
- `interface`/`type` defined inline and copy-pasted across components.
- Formatting/validation/calculation helpers written inline instead of in `utils/`.
- Merging unrelated components (`Header` + `Sidebar` + `Footer`) into one file "to save time."
- One giant `useState`/`useReducer` in `page.tsx` covering a whole multi-feature page instead of split hooks.

---

## How the two parts work together

When building or redesigning a UI feature, do both passes, not one:
1. Design pass: token system (color/type/layout/signature) reviewed against the brief for distinctiveness.
2. Architecture pass: map roles (UI/hook/logic/api/types) before writing files.

A visually distinctive component that dumps logic into the JSX is not done. A perfectly separated component with a templated, generic look is not done either. Both bars must be cleared in the same pass.