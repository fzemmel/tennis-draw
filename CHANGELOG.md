# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/fzemmel/tennis-draw/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/fzemmel/tennis-draw/releases/tag/v0.1.0
