import type { WorkflowDefinition } from "../types";
import type { ExtractionOutput } from "../extractor";

export type ExtractionProvider = {
  name: string;
  extract: (workflow: WorkflowDefinition, input: string) => Promise<ExtractionOutput>;
};
