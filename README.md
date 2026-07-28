# 🎾 Tennis-Mixer

A smart rotation manager for tennis doubles with 5 players — built as a mobile-first Progressive Web App.

## What it does

Tennis-Mixer tracks who plays and who sits on the bench across rounds of doubles. After each game it suggests the optimal player swap, balancing:

- **Bench time** – players who sat out longest are prioritized to come in
- **Partner variety** – avoids repeating the same pairs
- **Opponent variety** – spreads opponent matchups as evenly as possible
- **Serve rotation** – follows standard doubles serve rules

A stats panel shows play count, bench count, serve count, and a full partner-history matrix.

## Features

- 🔄 Smart next-swap algorithm with tie-breaking randomness
- 📊 Stats table + partner/opponent matrix
- 📡 Dual sync modes: **local** (localStorage) and **shared** (multi-device via `window.storage` API)
- 📲 Installable PWA — works offline, no app store needed
- ⚡ Fast, no backend required

## Tech Stack

| Layer | Technology |
|---|---|
| UI | React 18 + TypeScript |
| Styling | Tailwind CSS v3 |
| Build | Vite 6 |
| PWA | vite-plugin-pwa + Workbox |
| Component docs | Storybook 10 |
| Icons | lucide-react |

## Getting Started

```bash
# 1. Install dependencies
npm install

# 2. Start dev server (http://localhost:5173)
npm run dev

# 3. Build for production
npm run build

# 4. Preview production build
npm run preview
```

### Storybook

Component stories for `Button`, `TeamCard`, `StatTable`, and the full `TennisMixer` view:

```bash
npm run storybook        # dev server on http://localhost:6006
npm run build-storybook  # static build to storybook-static/
```

## PWA Install

Open the app in Chrome/Safari on your phone and tap **"Add to Home Screen"**. The app works fully offline after the first load.

## Sync Modes

| Mode | How it works |
|---|---|
| **local** | State lives in `localStorage` on the current device |
| **shared** | State is read/written via `window.storage` (shared across devices, e.g. on Glitch/Replit-style hosts) |

The app auto-detects which mode is available on startup. In shared mode, state is polled every 2.5 s so all devices stay in sync.

## Project Structure

```
src/
├── lib/
│   ├── types.ts        # TypeScript interfaces (GameState, ChangeEvent, …)
│   ├── tennis.ts       # Core logic: initState, computeNext, serverFor
│   └── storage.ts      # Persistence: loadState, saveState, pollSharedState
├── components/
│   ├── ui/
│   │   └── Button.tsx  # Reusable button primitive
│   └── TennisMixer/
│       ├── TennisMixer.tsx   # Root component / orchestrator
│       ├── TeamCard.tsx      # Displays one team of two players
│       ├── BenchDisplay.tsx  # Shows the benched player
│       ├── ChangeNotice.tsx  # Swap notification banner
│       ├── SyncBadge.tsx     # Sync mode indicator
│       ├── StatTable.tsx     # Play/bench/serve stats
│       └── PartnerMatrix.tsx # Partner history grid
├── stories/            # Storybook stories
├── App.tsx
└── main.tsx
```

## License

MIT
