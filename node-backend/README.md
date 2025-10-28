# Agentic Builder POC Backend

Simple TypeScript + Express backend for storing and executing "workflows" using MongoDB.

## What this repo contains

- `src/index.ts` - app entrypoint, express setup, health check, mounts routes, connects to DB.
- `src/config/env.ts` - environment configuration (port, mongodb URI, agentic builder API URL).
- `src/config/db.ts` - mongoose connect/disconnect helpers.
- `src/controllers/workflowController.ts` - CRUD + execute handlers for workflows. Uses Axios to call an external Agentic Builder API for generation/execution.
- `src/modals/Workflow.ts` - Mongoose schema/model for workflows (nodes, edges, metadata).
- `src/routers/workflowRoutes.ts` - API routes mounted under `/api`.
- `package.json` - npm scripts and dependencies (Express, Mongoose, Axios, TypeScript, nodemon, ts-node).
- `tsconfig.json` - TypeScript compiler configuration (outputs to `dist/`).

## Quick start

1. Install dependencies

```powershell
npm install
```

2. Development (runs with ts-node via nodemon)

```powershell
npm run dev
```

This runs `nodemon src/index.ts` so changes reload automatically.

3. Build (compile TypeScript to `dist`)

```powershell
npm run build
```

4. Start production build

```powershell
npm run start
```

## Environment / config

The app reads environment variables and falls back to sensible defaults in `src/config/env.ts`:

- `PORT` (default: `8004`)
- `MONGODB_URI` (default: `mongodb://localhost:27017/agentic-builder-poc`)
- `NODE_ENV` (default: `development`)
- `AGENT_BUILDER_API_URL` (default: `http://192.168.30.23:8000`)
