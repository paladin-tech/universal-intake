import { getWorkflow } from "./workflows";
import { deterministicExtractionProvider, getExtractionProvider } from "./providers";
import type { IntakeRequest, IntakeResult, MissingField } from "./types";

export async function runIntake(request: IntakeRequest): Promise<IntakeResult> {
  const workflow = getWorkflow(request.workflowId);

  if (!workflow) {
    return {
      workflowId: request.workflowId,
      status: "invalid",
      payload: {},
      missingFields: [],
      validation: {
        success: false,
        errors: [`Unknown workflow: ${request.workflowId}`],
      },
      confidence: {},
      provenance: {},
      extraction: {
        provider: "none",
        fallbackUsed: false,
        warnings: [],
      },
    };
  }

  const provider = getExtractionProvider();
  const warnings: string[] = [];
  let providerName = provider.name;
  let fallbackUsed = false;
  const extraction = await provider.extract(workflow, request.input).catch(async (error: unknown) => {
    fallbackUsed = true;
    providerName = deterministicExtractionProvider.name;
    warnings.push(error instanceof Error ? error.message : "Extraction provider failed.");

    return deterministicExtractionProvider.extract(workflow, request.input);
  });
  const validationResult = workflow.schema.safeParse(extraction.payload);
  const missingFields = getMissingFields(workflow.requiredFields, extraction.payload, workflow.missingFieldMessages);
  const validationErrors = validationResult.success
    ? []
    : validationResult.error.issues.map((issue) => `${issue.path.join(".")}: ${issue.message}`);

  return {
    workflowId: workflow.id,
    status: validationResult.success && missingFields.length === 0 ? "complete" : "needs_clarification",
    payload: validationResult.success ? validationResult.data : extraction.payload,
    missingFields,
    validation: {
      success: validationResult.success,
      errors: validationErrors,
    },
    confidence: extraction.confidence,
    provenance: extraction.provenance,
    extraction: {
      provider: providerName,
      fallbackUsed,
      warnings,
    },
  };
}

function getMissingFields(
  requiredFields: string[],
  payload: Record<string, unknown>,
  messages: Record<string, string>,
): MissingField[] {
  return requiredFields
    .filter((field) => payload[field] === undefined || payload[field] === null || payload[field] === "")
    .map((field) => ({ field, message: messages[field] ?? `${field} is required.` }));
}
