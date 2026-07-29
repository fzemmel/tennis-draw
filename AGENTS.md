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

`GameState.bench` is a `string[]` — a **FIFO queue** of bench players ordered by how long they have been sitting out (longest first). `bench[0]` is always the next player coming onto the court. With 5 players the array has length 1; with 6 players length 2; with n players length n − 4.

### `src/lib/tennis.ts`
- `PLAYERS` — the **hardcoded** array of player names. This is intentional; the app is built for a fixed group.
- `initState(players)` — assigns the first 4 players to court, the rest to the `bench` array (FIFO queue); initialises all counters for every player.
- `computeNext(state)` — computes the optimal next swap **without mutating** the input state. Returns a new `GameState`. The incoming player is always `state.bench[0]`; the outgoing player is chosen by the existing scoring function and appended to the end of the bench queue (`[...state.bench.slice(1), out]`). The scoring function: `score = partnerFresh * 3 + oppFresh + rand(0..0.5)`. Lower score = better swap.
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

## CI / CD

Two GitHub Actions workflows live in `.github/workflows/`:

| Workflow | Trigger | What it does |
|---|---|---|
| `ci.yml` | push / PR → `main` | Lint + Test + Storybook build |
| `deploy.yml` | push / PR → `main` | Lint + Test, then deploy to **Vercel** |

**deploy.yml jobs:**
1. `ci` — lint and test (must pass before deploy)
2. `deploy` — runs `vercel pull / build / deploy` via the Vercel CLI
   - Push to `main` → production deploy (`--prod`)
   - Pull request → preview deploy; URL is posted as a PR comment

**Required repository secrets:** `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
See `README.md` → *Deployment* for setup instructions.

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

Every pull request that adds, changes, renames, or removes a UI component or visible UI state must update the corresponding Storybook stories in the same pull request.

**Story requirements:**
- Every component under `src/components/ui/` and `src/components/TennisMixer/` must have a direct story unless composed coverage is explicitly justified in the pull request.
- Cover representative states and variants rather than only the default state.
- Localized components must respond to the global German/English locale toolbar.
- Stories must be deterministic and independent of persisted browser state such as `localStorage`.
- Use `fn()` spies and `play` functions from `storybook/test` for meaningful interactions and callbacks.
- Keep story exports, titles, descriptions, and fixture metadata in English.

Run `npm run build-storybook` after changing UI or stories. CI runs this command and must pass before merge.

---

## Changelog Policy

### When to update `CHANGELOG.md`

Every pull request that introduces a **notable user-facing or developer-facing change** must include an update to `CHANGELOG.md` in the same pull request. This keeps the changelog a reliable summary of project changes.

Examples of **notable changes** that require a changelog entry:
- New features or UI additions
- Bug fixes that affect observable behaviour
- Breaking changes or removals
- Dependency upgrades with behavioural impact
- New scripts, commands, or developer workflows
- Security fixes

**Exceptions** — a changelog entry may be omitted when the change has no relevant behavioural impact, for example:
- Formatting or whitespace-only edits
- Typo fixes in code comments
- Internal refactoring with no externally visible effect

When no changelog entry is needed, the pull request description must explicitly state this and briefly explain why.

### Writing entries

Add unreleased entries under the `## [Unreleased]` section at the top of `CHANGELOG.md`, using the appropriate [Keep a Changelog](https://keepachangelog.com/en/1.1.0/) category:

| Category | When to use |
|---|---|
| `Added` | New feature or capability |
| `Changed` | Change to existing behaviour |
| `Deprecated` | Feature marked for future removal |
| `Removed` | Feature or file removed |
| `Fixed` | Bug fix |
| `Security` | Vulnerability fix |

Write entries **from the perspective of users or maintainers** — describe the resulting behaviour, not implementation details. Keep all text in **English**.

```markdown
## [Unreleased]

### Added
- New X feature that allows users to do Y

### Fixed
- Z no longer crashes when the player list is empty
```

### Release process

When publishing a new version:

1. Move all relevant `[Unreleased]` entries into a new versioned section directly below `[Unreleased]`, following the format `## [X.Y.Z] – YYYY-MM-DD`.
2. Leave an empty `## [Unreleased]` section at the top for future changes.
3. Add a comparison link at the bottom of the file:
   ```
   [X.Y.Z]: https://github.com/fzemmel/tennis-draw/compare/vA.B.C...vX.Y.Z
   ```
4. Update the `[Unreleased]` link to point to the new version:
   ```
   [Unreleased]: https://github.com/fzemmel/tennis-draw/compare/vX.Y.Z...HEAD
   ```

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
