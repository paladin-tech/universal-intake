import { deterministicExtractionProvider } from "./deterministic";
import { openAIExtractionProvider } from "./openai";
import type { ExtractionProvider } from "./types";

export function getExtractionProvider(): ExtractionProvider {
  if (process.env.OPENAI_API_KEY) {
    return openAIExtractionProvider;
  }

  return deterministicExtractionProvider;
}

export { deterministicExtractionProvider, openAIExtractionProvider };
