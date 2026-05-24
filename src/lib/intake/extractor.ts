import type { FieldConfidence, FieldProvenance, WorkflowDefinition } from "./types";

export type ExtractionOutput = {
  payload: Record<string, unknown>;
  confidence: Record<string, FieldConfidence>;
  provenance: Record<string, FieldProvenance>;
};

export async function extractForWorkflow(workflow: WorkflowDefinition, input: string): Promise<ExtractionOutput> {
  const payload: Record<string, unknown> = {};
  const confidence: Record<string, FieldConfidence> = {};
  const provenance: Record<string, FieldProvenance> = {};
  const normalizedInput = input.toLowerCase();

  for (const field of workflow.requiredFields) {
    const match = normalizedInput.match(new RegExp(`${field.toLowerCase()}[:=]\\s*([^,\\n]+)`));

    if (match?.[1]) {
      payload[field] = coerceValue(match[1].trim());
      confidence[field] = { score: 0.7, reason: "Matched explicit field label in input." };
      provenance[field] = { source: "input", quote: match[0] };
    }
  }

  return { payload, confidence, provenance };
}

function coerceValue(value: string): string | number | boolean {
  if (value === "true") {
    return true;
  }

  if (value === "false") {
    return false;
  }

  const numberValue = Number(value);

  if (!Number.isNaN(numberValue) && value.trim() !== "") {
    return numberValue;
  }

  return value;
}
