# Universal Intelligent Intake Architecture

Last Updated: 2026-05-23

## Architecture Summary

Universal Intelligent Intake is a Next.js full-stack application that provides a reusable ingestion engine for runtime-known workflows.

The calling application or UI selects the workflow context before ingestion begins. The system then uses AI only for context-bound understanding and extraction against the selected schema.

## Critical Design Decision

The engine does not ask AI to choose the workflow or schema.

Workflow selection is deterministic and supplied by runtime context, such as:

- Calling application identity.
- Explicit API parameter.
- UI-selected workflow.
- Route or integration configuration.

This reduces ambiguity and improves reliability because AI operates inside a known business context.

## Conceptual Flow

```text
Caller or UI
  -> selected workflow id
  -> free-form input
  -> workflow registry lookup
  -> schema-bound AI extraction
  -> deterministic validation
  -> missing field detection
  -> confidence and provenance enrichment
  -> normalized intake result
  -> downstream workflow or caller response
```

## Main Components

### Workflow Registry

Defines available workflows and maps workflow IDs to schemas, extraction instructions, validators, and downstream behavior.

Initial example workflows:

- `insurance_quote`
- `cargo_record`

### Workflow Definition

A workflow definition should include:

- Stable workflow ID.
- Human-readable name and description.
- Input assumptions.
- Zod schema.
- Required fields.
- Extraction guidance.
- Deterministic validators.
- Missing field messages.
- Optional downstream action metadata.

### Intake Orchestrator

Coordinates the ingestion process:

1. Accept workflow ID and free-form input.
2. Load workflow definition.
3. Ask the AI extractor to populate only the selected schema.
4. Run deterministic validation.
5. Detect missing required information.
6. Return normalized result.

### AI Extraction Adapter

Provides a provider-agnostic interface for schema-bound extraction.

The adapter should avoid embedding domain logic directly in provider-specific code.

### Validation Layer

Performs deterministic validation using schema rules and workflow-specific validators.

Validation is authoritative. AI output is never accepted as business-valid without deterministic checks.

### Minimal Web UI

The UI should support early testing by allowing a user to:

- Select a workflow.
- Paste free-form input.
- Submit ingestion request.
- Inspect extracted payload, missing fields, validation results, confidence, and provenance.

### API Layer

The API should expose ingestion for programmatic callers.

A representative request shape:

```json
{
  "workflowId": "insurance_quote",
  "input": "Need quote for Toyota Corolla 2022 in Belgrade...",
  "metadata": {
    "source": "demo-ui"
  }
}
```

A representative response shape:

```json
{
  "workflowId": "insurance_quote",
  "status": "needs_clarification",
  "payload": {},
  "missingFields": [],
  "validation": {},
  "confidence": {},
  "provenance": {}
}
```

## Reliability Principles

- Workflow context is deterministic.
- Extraction is schema-constrained.
- Validation is deterministic.
- Missing information is returned explicitly.
- Low-confidence fields are visible to callers.
- Provenance should identify where values came from when possible.
- Domain logic belongs in workflow modules, not in the generic engine.

## Initial System Boundaries

In scope for the initial architecture:

- Next.js app shell.
- Intake API.
- Minimal testing UI.
- Workflow registry.
- Example workflows.
- Zod schemas.
- Provider abstraction.

Out of scope for initial architecture:

- Authentication.
- Production persistence.
- Multi-tenant administration.
- External downstream integrations.
- AI-driven workflow classification.
- Complex workflow chaining.
