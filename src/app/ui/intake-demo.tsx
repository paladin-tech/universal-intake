"use client";

import { FormEvent, useState } from "react";
import type { IntakeResult } from "@/lib/intake/types";

type WorkflowOption = {
  id: string;
  name: string;
  description: string;
};

type IntakeDemoProps = {
  workflows: WorkflowOption[];
};

export function IntakeDemo({ workflows }: IntakeDemoProps) {
  const [workflowId, setWorkflowId] = useState(workflows[0]?.id ?? "");
  const [input, setInput] = useState("vehicleMake: Toyota, vehicleModel: Corolla, vehicleYear: 2022, location: Belgrade, driverBirthYear: 1990");
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
          <select id="workflow" value={workflowId} onChange={(event) => setWorkflowId(event.target.value)}>
            {workflows.map((workflow) => (
              <option key={workflow.id} value={workflow.id}>
                {workflow.name}
              </option>
            ))}
          </select>

          <label htmlFor="input">Free-form input</label>
          <textarea id="input" value={input} onChange={(event) => setInput(event.target.value)} rows={12} />

          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Processing..." : "Run intake"}
          </button>
        </form>

        <section className="card resultCard">
          <h2>Result</h2>
          {error ? <p className="error">{error}</p> : null}
          {result ? <pre>{JSON.stringify(result, null, 2)}</pre> : <p className="muted">Submit an intake request to see output.</p>}
        </section>
      </section>
    </main>
  );
}
