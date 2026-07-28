# AGENTS.md — Guidance for AI Coding Agents

This file describes the architecture, conventions, and key decisions in **Tennis-Mixer** so that AI agents can contribute effectively.

> **Language policy:** All project files, code comments, commit messages, test descriptions, and documentation must be written in **English** — regardless of the language used in prompts or conversations.

---

## Architecture Overview

```
src/
├── lib/            # Pure logic, no React
│   ├── types.ts    # All shared TypeScript types
│   ├── tennis.ts   # Game logic (stateless, pure functions)
│   └── storage.ts  # Async persistence layer
└── components/
    ├── ui/         # Generic primitives (Button)
    └── TennisMixer/  # Feature-specific components
        └── TennisMixer.tsx  # Single stateful root component
```

The application has a strict **one-way data flow**:

```
loadState()
    │
    ▼
GameState  ──────────────────────────────────────────────────►  render
    │                                                             │
    │  nextChange()                                              user action
    ▼                                                             │
computeNext(state)  →  new GameState  →  persist()  →  setState()
```

All game logic lives in `src/lib/tennis.ts` and is **pure** (no side effects, no React). Components only call `computeNext()` and pass the result to `persist()`.

---

## Key Files

### `src/lib/types.ts`
Defines all shared types. `GameState` is the single source of truth. Never add component-local state that duplicates fields already in `GameState`.

### `src/lib/tennis.ts`
- `PLAYERS` — the **hardcoded** array of player names. This is intentional; the app is built for a fixed group.
- `initState(players)` — shuffles players, assigns teams and bench, initialises all counters.
- `computeNext(state)` — computes the optimal next swap **without mutating** the input state. Returns a new `GameState`. The scoring function: `score = partnerFresh * 3 + oppFresh + rand(0..0.5)`. Lower score = better swap.
- `serverFor(round, home, guest)` — pure serve-order calculation following doubles rotation rules.

### `src/lib/storage.ts`
Three async functions with a **storage fallback chain**:

```
window.storage (shared, multi-device)
    │  if unavailable or error
    ▼
localStorage (local, single device)
    │  if unavailable (private mode, SSR)
    ▼
in-memory MEM object (session only)
```

`loadState()` returns `{ state, mode }` — `mode` is `"shared"` only when `window.storage` was successfully read.

`pollSharedState()` is called on a 2500 ms interval in `TennisMixer.tsx` when `syncMode === "shared"` to pull updates from other devices.

### `src/components/TennisMixer/TennisMixer.tsx`
The **only stateful component**. Responsibilities:
- Bootstraps state from `loadState()` on mount
- Manages `syncMode`, `showStats`, `confirmReset` UI flags
- Provides `persist(newState)` helper that stamps `ts: Date.now()` before saving
- Renders the full UI tree; all child components are **presentational** (props-only, no hooks)

---

## Coding Conventions

- **TypeScript strict mode** — do not use `any`. Use the types from `types.ts`.
- **No mutation** — `GameState` and its nested objects must never be mutated in place. Always spread: `{ ...state, playCount: { ...state.playCount } }`.
- **Pure game logic** — `tennis.ts` must not import React or call side-effect APIs. Keep it framework-independent.
- **Functional React** — no class components.
- **Tailwind only** — no inline `style={{}}`, no CSS modules. Use Tailwind utility classes.
- **Lucide icons** — import individual icons from `lucide-react`. Do not add other icon libraries.
- **No new runtime dependencies** without a strong reason — the dependency surface is intentionally small.

---

## Available Scripts

| Command | Description |
|---|---|
| `npm run lint` | ESLint (flat config, TypeScript + React rules) |
| `npm run dev` | Vite dev server on http://localhost:5173 |
| `npm run build` | TypeScript check + Vite production build to `dist/` |
| `npm run preview` | Serve the `dist/` build locally |
| `npm test` | Vitest (single run) |
| `npm run test:watch` | Vitest in watch mode |
| `npm run coverage` | Test coverage with v8 |
| `npm run storybook` | Storybook dev server on http://localhost:6006 |
| `npm run build-storybook` | Static Storybook build to `storybook-static/` |

---

## Gotchas & Important Notes

### Hardcoded player list
`PLAYERS` in `src/lib/tennis.ts` is a typed `const` array. All counters in `GameState` use player names as keys. If you need to make the player list configurable, `initState`, `computeNext`, and `TennisMixer.tsx` all need updating.

### `ts` timestamp field
`GameState.ts` is a Unix timestamp (ms). It is used as a **conflict-resolution signal** in shared sync: the device with the highest `ts` wins. Always update `ts` via the `persist()` helper in `TennisMixer.tsx`, never manually.

### `lastIn` guard in `computeNext`
The algorithm excludes the player who just came in (`state.lastIn`) from being swapped out again in the very next round. This prevents the same player from playing a single game. Do not remove this guard.

### PWA manifest
Icons are expected at `public/icons/icon-192.png` and `public/icons/icon-512.png`. Vite builds will succeed without them, but the PWA manifest will reference missing assets.

### Storybook
Stories live in `src/stories/`. The Storybook framework is `@storybook/react-vite`. All Storybook packages must stay at the **same major version** as the `storybook` core package.

---

## Testing & TDD

Tests live in `src/lib/__tests__/`. Framework: **Vitest** with a jsdom environment.

### Test files

| File | Coverage |
|---|---|
| `tennis.test.ts` | `pairKey`, `serverFor`, `initState`, `computeNext` |
| `storage.test.ts` | `loadState`, `saveState`, `pollSharedState` (with mocked `window.storage` / `localStorage`) |

### TDD workflow

**Always develop new logic in `src/lib/` test-first:**

1. **Red** — Write a test that describes the desired behaviour. It must fail.
2. **Green** — Write the minimal implementation to make the test pass.
3. **Refactor** — Clean up without breaking tests. `npm test` must stay green.

**Rules:**
- No new public functions in `tennis.ts` or `storage.ts` without a corresponding test.
- Tests describe **behaviour**, not implementation details. Internals (`recordCurrent`, `MEM`) are tested indirectly through the public API.
- Storage tests mock `window.storage` via `window.storage = { get: vi.fn(), set: vi.fn() }` and call `vi.resetModules()` in `beforeEach` to prevent the in-memory fallback (module-level variable) from leaking between tests.
- Verify `GameState` immutability in tests: capture the state before calling, compare after.
- For functions with randomness (`initState`, `computeNext`), test invariants (e.g. player count, no mutation) — not exact outputs.

### Targeted test commands

```bash
# Single file
npx vitest run src/lib/__tests__/tennis.test.ts

# All tests
npm test

# Watch mode during development
npm run test:watch
```
