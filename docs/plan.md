# Universal Intelligent Intake Plan

Last Updated: 2026-05-24

## Product Summary

Universal Intelligent Intake is an AI-assisted, schema-driven ingestion platform that converts ambiguous enterprise communication into validated structured payloads for downstream workflows.

The system is intentionally not an AI email parser and not an insurance-specific accelerator. It is a reusable intake layer for known runtime use cases where the calling application provides the workflow context up front.

## Core Positioning

Universal Intelligent Intake provides a pluggable ingestion engine for business applications that already know what workflow is being executed, but need help converting free-form human input into schema-conformant structured data.

Examples:

- Insurance application calls the intake engine with an insurance quote workflow context.
- Cargo management application calls the intake engine with a cargo record workflow context.
- Future applications can provide additional workflow definitions, schemas, validators, and downstream adapters.

## Key Scope Decision

The system will not rely on AI to guess which schema or workflow applies.

Runtime context determines the workflow. AI is used for:

- Understanding free-form user input within the selected workflow.
- Extracting schema-specified content.
- Preserving ambiguity instead of forcing unsupported certainty.
- Producing confidence and provenance metadata.
- Supporting missing information detection.

This narrows the core problem from broad intent classification to reliable context-bound extraction and validation.

## Initial MVP Direction

The MVP is engine-first with a minimal web UI and API.

The first implementation should establish:

- A Next.js full-stack application.
- A workflow registry.
- Runtime workflow selection by caller or UI.
- Schema-constrained extraction contracts.
- Deterministic validation after AI extraction.
- Missing field detection.
- Confidence and provenance model.
- Example workflows for insurance quote intake and cargo record intake.

## Technology Direction

Preferred stack:

- Next.js full-stack application.
- TypeScript.
- Zod for schema definitions and validation.
- API routes or server actions for ingestion endpoints.
- Minimal web UI for manual testing and demonstration.
- LLM provider abstraction to avoid hard-coding one provider into domain logic.

Python backend is not planned unless a later requirement creates a clear advantage.

## Primary Architecture Documents

- `docs/architecture.md` defines the initial architecture and system boundaries.

No sub-plans are currently required. Sub-plans may be added later if frontend, backend, AI, or evaluation work becomes large enough to require separate planning.

## Initial Work Orders

Initial execution is tracked in `docs/work_orders.yaml`.

Current active work order:

- `UINT-007`: Commit and push progress to main branch.

## Work Order Management Policy

The project uses a rolling work-order queue.

After each completed work order, the agent should inspect this plan and maintain:

- One active work order when implementation should continue.
- One to three next work orders for near-term visibility.
- Completed work orders as execution history.

This avoids an empty execution queue while preventing premature over-specification of distant work.

Completed work orders:

- `UINT-001`: Establish SDD foundation and initial project architecture.
- `UINT-002`: Scaffold Next.js application and initial intake engine.
- `UINT-003`: Add provider abstraction and OpenAI schema-bound extraction.
- `UINT-004`: Improve intake result contract and UI inspection.
- `UINT-005`: Add basic extraction evaluation fixtures.
- `UINT-006`: Add `.env.example` and developer setup documentation.

## Product Principles

- Runtime-known workflow context is authoritative.
- AI extraction must be constrained by an explicit schema.
- Validation must be deterministic and separate from AI generation.
- Missing information is a first-class outcome, not an error condition.
- Extracted values should carry confidence and provenance where feasible.
- Domain-specific behavior belongs in workflow definitions, validators, and adapters.
- The generic engine should remain decoupled from insurance, cargo, or any single vertical.

## In Scope

- Generic intake orchestration.
- Workflow registry.
- Workflow-specific schemas.
- Schema-bound extraction.
- Deterministic validation.
- Missing field reporting.
- Confidence and provenance metadata.
- Minimal web UI for testing workflows.
- API endpoint for programmatic ingestion.
- Insurance quote and cargo record examples.

## Out of Scope for Initial MVP

- AI-based workflow or schema guessing.
- Multi-intent decomposition.
- Workflow chaining.
- Full human review queue.
- Production authentication and authorization.
- External system integrations.
- Complex schema version migration.
- Full evaluation harness.

## Experimental Features

The following ideas are captured for later evaluation, not immediate execution:

- Clarification conversation loop.
- Multi-channel input adapters.
- Multi-intent decomposition.
- Workflow chaining.
- Human-in-the-loop review UI.
- Schema version inheritance.
- Automated extraction quality evaluation.
- **Broker/actor memory and knowledge graph**: Record completed intake flows per broker or actor in semantic format. Use semantic search over past flows to pre-fill extraction context, resolve low-confidence fields using historical patterns, and convert `needs_clarification` outcomes into soft-confirm suggestions. Highest-value use cases are extraction pre-fill for repeat actor+workflow combinations and anomaly detection when a flow deviates significantly from historical patterns. Key architectural constraint: memory is a read-only enrichment layer applied before extraction; deterministic validation must remain independent of memory. Provenance for memory-sourced values would use `source: "memory"` alongside `source: "input"`. Risk areas: stale memory when actor behavior changes, privacy and access governance for business-sensitive activity graphs, and clearly distinguishing input-extracted vs memory-inferred values in confidence/provenance output.
