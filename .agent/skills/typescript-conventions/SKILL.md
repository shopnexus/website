---
name: typescript-conventions
description: Coding style and convention guide for writing or reviewing TypeScript code — naming, types vs interfaces, strictness, null handling, generics, error handling, file organization, and linting setup. Use whenever writing new TypeScript files, refactoring existing TypeScript, or reviewing TypeScript code for style consistency.
---

# TypeScript Style & Convention Guide

## Naming
- **PascalCase**: types, interfaces, classes, enums, type parameters (`UserProfile`, `interface ApiResponse`)
- **camelCase**: variables, functions, methods, properties (`getUserById`, `isLoading`)
- **UPPER_SNAKE_CASE**: true constants (`MAX_RETRIES`, `DEFAULT_TIMEOUT_MS`)
- Avoid `I` prefix for interfaces (`IUser` → `User`)
- Boolean names read as predicates: `isActive`, `hasPermission`, `canEdit`

## Types vs Interfaces
- Use `interface` for object shapes meant to be extended/implemented
- Use `type` for unions, intersections, tuples, mapped/conditional types
- Prefer `interface` for public API contracts; `type` for internal composition

```ts
interface User {
  id: string;
  name: string;
}

type Status = 'idle' | 'loading' | 'success' | 'error';
```

## Strictness
- Always enable `strict: true` in `tsconfig.json`
- Avoid `any` — use `unknown` and narrow, or generics
- No implicit `any` on function params/returns
- Avoid non-null assertions (`!`) except where truly unavoidable; prefer guards

## Functions
- Explicit return types on exported/public functions
- Prefer arrow functions for callbacks, `function` declarations for top-level/hoisted logic
- Keep params ≤ 3; beyond that, use an options object

```ts
function createUser(options: { name: string; email: string; role?: Role }): User { ... }
```

## Null/Undefined Handling
- Prefer `undefined` over `null` unless interfacing with APIs that use `null`
- Use optional chaining (`?.`) and nullish coalescing (`??`)
- Model absence explicitly rather than using sentinel values

## Enums vs Union Literals
- Prefer string literal unions over `enum` for most cases (better tree-shaking, structural typing)
- Use `const enum` or literal unions instead of runtime `enum` unless you need reverse mapping

```ts
type Direction = 'up' | 'down' | 'left' | 'right'; // preferred over enum
```

## Modules & Imports
- One export per concept per file where reasonable; index files for barrel re-exports
- Absolute imports via path aliases for deep trees; relative imports for siblings
- Group imports: external packages → internal aliases → relative paths, blank line between groups

## Generics
- Meaningful names for complex generics (`TData`, `TError`), single-letter (`T`, `K`, `V`) only for simple/obvious cases
- Constrain generics rather than leaving them unbounded (`<T extends Record<string, unknown>>`)

## Error Handling
- Use discriminated unions or `Result<T, E>` patterns for expected failures
- Reserve `throw`/exceptions for truly exceptional, unrecoverable states
- Type custom errors by extending `Error` with a `name` and structured fields

## File Organization
```
src/
  types/       # shared type definitions
  utils/       # pure functions
  services/    # API/data access
  components/  # UI (if frontend)
  hooks/       # framework hooks
```

## Linting/Formatting
- ESLint with `@typescript-eslint` recommended + strict rule sets
- Prettier for formatting, enforced via pre-commit hook
- No unused vars/imports; consistent import ordering (e.g. `eslint-plugin-import`)

## Comments & Docs
- JSDoc on exported functions/types for public APIs
- Avoid comments that restate the code; explain *why*, not *what*
