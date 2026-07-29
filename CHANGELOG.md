# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Support for variable player counts (6, 7, or more players): `GameState.bench` is now a `string[]` FIFO queue; the Splashscreen accepts any selection of 5 or more players; the bench display shows all waiting players with the next-up player highlighted; with 6 players (2 bench) both bench players are substituted in simultaneously each round
- Changelog contribution policy in `AGENTS.md`: requirement to update `CHANGELOG.md` for every notable change, guidance on `[Unreleased]` categories, release process, and omission rules
- Pull-request template (`.github/PULL_REQUEST_TEMPLATE.md`) with a changelog update checkbox
- German and English UI localization with a device-local language selector, accessible language metadata, localized PWA install details, and deterministic Storybook locale coverage
- CI validation for Storybook builds
- Complete Storybook coverage for every UI component, including representative splash-screen, synchronization, statistics, and language-selection states
- Contribution policy requiring Storybook updates in the same pull request as UI changes
- Root-level `CLAUDE.md` that imports `AGENTS.md` so Claude Code uses the canonical repository guidance without duplicating shared instructions
- Vercel Web Analytics integration for privacy-conscious Production and Preview page-view reporting

## [0.2.0] – 2026-07-28

### Added
- Automated deployment to **Vercel** via GitHub Actions (`deploy.yml`)
  - Push to `main` triggers a production deploy
  - Pull requests get an isolated preview deployment; the URL is posted automatically as a PR comment
- `vercel.json` — build config and SPA rewrites so direct URL navigation doesn't 404
- CI/CD section in `AGENTS.md` documenting the workflow structure and required secrets

## [0.1.0] – 2026-07-28

### Added
- Initial Tennis-Mixer PWA — Vite + React + TypeScript + Tailwind + PWA manifest
- Game logic (`src/lib/tennis.ts`): `initState`, `computeNext`, `serverFor`, `pairKey`
- Async storage layer (`src/lib/storage.ts`) with `window.storage` → `localStorage` → in-memory fallback chain
- Shared sync via `pollSharedState` (2 500 ms interval when `syncMode === "shared"`)
- Storybook setup with `@storybook/react-vite`
- `AGENTS.md` — architecture reference and coding conventions for AI agents
- Vitest test suite (38 tests) for `tennis.ts` and `storage.ts` with jsdom environment and v8 coverage
- ESLint flat config (`eslint.config.js`) with TypeScript, React Hooks, and React Refresh rules

[Unreleased]: https://github.com/fzemmel/tennis-draw/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/fzemmel/tennis-draw/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/fzemmel/tennis-draw/releases/tag/v0.1.0
