# Universal Intelligent Intake

An AI-assisted, schema-driven ingestion platform that converts ambiguous enterprise communication into validated structured payloads for downstream workflows.

The workflow context is always known at runtime — provided by the calling application. AI performs schema-bound extraction only; it does not classify intent or choose a schema.

## Architecture

See [`docs/architecture.md`](docs/architecture.md) for system design and component overview.  
See [`docs/plan.md`](docs/plan.md) for product scope and work order history.

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your `OPENAI_API_KEY` if you want to use real LLM-based extraction. Without it, the engine uses the deterministic fallback extractor automatically.

### 3. Run the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to access the demo UI.

## Commands

| Command | Description |
|---|---|
| `npm run dev` | Start the Next.js development server |
| `npm run build` | Production build |
| `npm run start` | Start the production server |
| `npm run typecheck` | TypeScript type check (no emit) |
| `npm run lint` | ESLint |
| `npm run evaluate` | Run extraction evaluation fixtures |

## Evaluation

The evaluation script runs a set of deterministic fixtures against the intake engine without requiring an OpenAI key:

```bash
npm run evaluate
```

Fixtures are defined in [`src/lib/intake/evaluation/fixtures.ts`](src/lib/intake/evaluation/fixtures.ts) and cover:

- Complete input (all required fields present)
- Partial input (some required fields missing)
- Empty/vague input (no extractable fields)
- Invalid workflow ID

## Adding a workflow

1. Add a Zod schema and workflow definition to [`src/lib/intake/workflows.ts`](src/lib/intake/workflows.ts).
2. Add representative fixtures to [`src/lib/intake/evaluation/fixtures.ts`](src/lib/intake/evaluation/fixtures.ts).
3. Run `npm run evaluate` to verify extraction behavior.

## Environment variables

| Variable | Required | Description |
|---|---|---|
| `OPENAI_API_KEY` | No | OpenAI API key. Falls back to deterministic extractor when absent. |
| `OPENAI_MODEL` | No | OpenAI model name. Defaults to `gpt-4.1-mini`. |
