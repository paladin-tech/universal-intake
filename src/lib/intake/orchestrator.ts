import { getWorkflow } from "./workflows";
import { extractForWorkflow } from "./extractor";
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
    };
  }

  const extraction = await extractForWorkflow(workflow, request.input);
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
