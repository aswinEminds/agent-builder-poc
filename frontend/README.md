# agentic-builder-poc

A small proof-of-concept web app for visually building and running agentic/workflow-style flows. It's implemented with React + TypeScript and uses Vite for fast local development.

High-level summary

- Purpose: UI to compose and run workflows (nodes, integrations, API calls, agents)
- Tech: React 19, TypeScript, Vite, Tailwind, React Flow, Tanstack Query.
- Structure (high level):
  - `src/features/*` — feature areas (home, workflow, etc.)
  - `src/shared/*` — shared UI components, layouts and utilities
  - `src/config`, `src/http`, `src/router` — app wiring and client setup
  - `public/` — static assets

Prerequisites

- Node.js 18+ recommended (Node 16 may work, but newer Node gives better compatibility with modern deps).
- npm (bundled with Node) or an alternative package manager (pnpm/yarn) — commands below use npm.

Quick start (local development)

Open a terminal in the repository root and run:

```powershell
npm install
npm run dev
```

This starts Vite and serves the app at http://localhost:5173 (or another port if 5173 is occupied). Vite provides HMR for fast iteration.

Build & preview

Create a production build:

```powershell
npm run build
```

Preview the production build locally:

```powershell
npm run preview
```

Linting

Run ESLint across the project:

```powershell
npm run lint
```

Scripts

- `dev` — start Vite dev server
- `build` — type-check (tsc -b) and build with Vite
- `preview` — serve the production build locally
- `lint` — run ESLint

Environment variables

- Uses Vite's env system. Prefix custom keys with `VITE_` (for example `VITE_API_URL`) and place them in `.env` / `.env.local` as needed.

Where to look first

- `src/main.tsx` — app entry and root providers
- `src/App.tsx` — app shell and router
- `src/features/workflow/pages/WorkflowCanvas.tsx` — canvas and node interactions (core POC area)
