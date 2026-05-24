import type { ExtractionProvider } from "./types";

export const deterministicExtractionProvider: ExtractionProvider = {
  name: "deterministic",
  async extract(workflow, input) {
    const payload: Record<string, unknown> = {};
    const confidence: Record<string, { score: number; reason: string }> = {};
    const provenance: Record<string, { source: string; quote?: string }> = {};
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
  },
};

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
