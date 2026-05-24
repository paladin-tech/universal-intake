"use client";

import { FormEvent, useMemo, useState } from "react";
import type { IntakeResult } from "@/lib/intake/types";

type WorkflowOption = {
  id: string;
  name: string;
  description: string;
  requiredFields: string[];
  sampleInput: string;
};

type IntakeDemoProps = {
  workflows: WorkflowOption[];
};

export function IntakeDemo({ workflows }: IntakeDemoProps) {
  const [workflowId, setWorkflowId] = useState(workflows[0]?.id ?? "");
  const selectedWorkflow = useMemo(
    () => workflows.find((workflow) => workflow.id === workflowId) ?? workflows[0],
    [workflowId, workflows],
  );
  const [input, setInput] = useState(workflows[0]?.sampleInput ?? "");
  const [result, setResult] = useState<IntakeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);
    setResult(null);

    const response = await fetch("/api/intake", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ workflowId, input, metadata: { source: "demo-ui" } }),
    });

    const data = await response.json();

    if (!response.ok) {
      setError(data.error ?? "Request failed.");
    } else {
      setResult(data);
    }

    setIsSubmitting(false);
  }

  return (
    <main className="shell">
      <section className="hero">
        <p className="eyebrow">Universal Intelligent Intake</p>
        <h1>Schema-driven intake for known workflows</h1>
        <p className="lede">
          Select a runtime-known workflow, paste free-form intake text, and inspect the normalized response.
        </p>
      </section>

      <section className="grid">
        <form className="card" onSubmit={handleSubmit}>
          <label htmlFor="workflow">Workflow</label>
          <select
            id="workflow"
            value={workflowId}
            onChange={(event) => {
              const nextWorkflow = workflows.find((workflow) => workflow.id === event.target.value);
              setWorkflowId(event.target.value);
              setInput(nextWorkflow?.sampleInput ?? "");
              setResult(null);
              setError(null);
            }}
          >
            {workflows.map((workflow) => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.name}
              </option>
            ))}
          </select>

          {selectedWorkflow ? (
            <div className="workflowMeta">
              <p>{selectedWorkflow.description}</p>
              <h3>Required fields</h3>
              <div className="chips">
                {selectedWorkflow.requiredFields.map((field) => (
                  <span className="chip" key={field}>
                    {field}
                  </span>
                ))}
              </div>
            </div>
          ) : null}

          <label htmlFor="input">Free-form input</label>
          <textarea id="input" value={input} onChange={(event) => setInput(event.target.value)} rows={12} />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Run intake"}
          </button>
        </form>

        <section className="card resultCard">
          <h2>Result</h2>
          {error ? <p className="error">{error}</p> : null}
          {result ? <ResultInspector result={result} /> : <p className="muted">Submit an intake request to see output.</p>}
        </section>
      </section>
    </main>
  );
}

function ResultInspector({ result }: { result: IntakeResult }) {
  return (
    <div className="resultStack">
      <div className="statusRow">
        <span className={`statusPill ${result.status}`}>{result.status}</span>
        <span className="muted">Provider: {result.extraction.provider}</span>
        {result.extraction.fallbackUsed ? <span className="warningPill">fallback used</span> : null}
      </div>

      {result.extraction.warnings.length > 0 ? (
        <ResultSection title="Provider warnings" value={result.extraction.warnings} />
      ) : null}

      <ResultSection title="Payload" value={result.payload} />
      <ResultSection title="Missing fields" value={result.missingFields} />
      <ResultSection title="Validation" value={result.validation} />
      <ResultSection title="Confidence" value={result.confidence} />
      <ResultSection title="Provenance" value={result.provenance} />
    </div>
  );
}

function ResultSection({ title, value }: { title: string; value: unknown }) {
  return (
    <section className="resultSection">
      <h3>{title}</h3>
      <pre>{JSON.stringify(value, null, 2)}</pre>
    </section>
  );
}
