import type { ExtractionOutput } from "../extractor";
import type { WorkflowDefinition } from "../types";
import type { ExtractionProvider } from "./types";

const OPENAI_RESPONSES_URL = "https://api.openai.com/v1/responses";
const OPENAI_MODEL = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

type OpenAITextResponse = {
  output_text?: string;
  output?: Array<{
    content?: Array<{
      type?: string;
      text?: string;
    }>;
  }>;
};

export const openAIExtractionProvider: ExtractionProvider = {
  name: "openai",
  async extract(workflow, input) {
    const apiKey = process.env.OPENAI_API_KEY;

    if (!apiKey) {
      throw new Error("OPENAI_API_KEY is not configured.");
    }

    const response = await fetch(OPENAI_RESPONSES_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: OPENAI_MODEL,
        input: buildPrompt(workflow, input),
        text: {
          format: {
            type: "json_object",
          },
        },
      }),
    });

    if (!response.ok) {
      const message = await response.text();
      throw new Error(`OpenAI extraction failed: ${response.status} ${message}`);
    }

    const data = (await response.json()) as OpenAITextResponse;
    const text = extractResponseText(data);

    if (!text) {
      throw new Error("OpenAI extraction returned no text output.");
    }

    return normalizeExtractionOutput(JSON.parse(text));
  },
};

function buildPrompt(workflow: WorkflowDefinition, input: string): string {
  const schemaShape = workflow.requiredFields.map((field) => `${field}: value matching workflow schema`).join("\n");

  return [
    "You are a schema-bound extraction engine for Universal Intelligent Intake.",
    "The workflow is already known at runtime. Do not classify intent or choose another schema.",
    `Workflow id: ${workflow.id}`,
    `Workflow name: ${workflow.name}`,
    `Workflow description: ${workflow.description}`,
    `Extraction guidance: ${workflow.extractionGuidance}`,
    "Return only JSON with this exact shape:",
    "{\"payload\":{},\"confidence\":{},\"provenance\":{}}",
    "For each extracted field, payload[field] is the value, confidence[field] is {score:number, reason:string}, and provenance[field] is {source:string, quote:string}.",
    "Do not infer unavailable values. Omit fields that are missing or unsupported by the input.",
    "Allowed payload fields:",
    schemaShape,
    "Input:",
    input,
  ].join("\n\n");
}

function extractResponseText(response: OpenAITextResponse): string | undefined {
  if (response.output_text) {
    return response.output_text;
  }

  return response.output
    ?.flatMap((item) => item.content ?? [])
    .find((content) => content.type === "output_text" || content.text)?.text;
}

function normalizeExtractionOutput(value: unknown): ExtractionOutput {
  if (!isRecord(value)) {
    throw new Error("OpenAI extraction output was not an object.");
  }

  return {
    payload: isRecord(value.payload) ? value.payload : {},
    confidence: isRecord(value.confidence) ? value.confidence : {},
    provenance: isRecord(value.provenance) ? value.provenance : {},
  } as ExtractionOutput;
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
