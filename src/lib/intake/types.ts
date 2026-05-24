import type { z } from "zod";

export type IntakeStatus = "complete" | "needs_clarification" | "invalid";

export type FieldProvenance = {
  source: string;
  quote?: string;
};

export type FieldConfidence = {
  score: number;
  reason: string;
};

export type MissingField = {
  field: string;
  message: string;
};

export type WorkflowDefinition<TSchema extends z.ZodTypeAny = z.ZodTypeAny> = {
  id: string;
  name: string;
  description: string;
  schema: TSchema;
  requiredFields: string[];
  extractionGuidance: string;
  missingFieldMessages: Record<string, string>;
};

export type IntakeRequest = {
  workflowId: string;
  input: string;
  metadata?: Record<string, unknown>;
};

export type IntakeResult = {
  workflowId: string;
  status: IntakeStatus;
  payload: Record<string, unknown>;
  missingFields: MissingField[];
  validation: {
    success: boolean;
    errors: string[];
  };
  confidence: Record<string, FieldConfidence>;
  provenance: Record<string, FieldProvenance>;
};
