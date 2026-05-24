import { runIntake } from "../orchestrator";
import { fixtures, type EvaluationFixture } from "./fixtures";

type FixtureResult = {
  id: string;
  description: string;
  passed: boolean;
  failures: string[];
};

async function evaluateFixture(fixture: EvaluationFixture): Promise<FixtureResult> {
  const failures: string[] = [];
  const result = await runIntake({ workflowId: fixture.workflowId, input: fixture.input });

  if (result.status !== fixture.expectedStatus) {
    failures.push(`status: expected "${fixture.expectedStatus}", got "${result.status}"`);
  }

  for (const field of fixture.expectedPresentFields) {
    if (result.payload[field] === undefined || result.payload[field] === null || result.payload[field] === "") {
      failures.push(`expected field present in payload: ${field}`);
    }
  }

  const missingFieldNames = result.missingFields.map((mf) => mf.field);

  for (const field of fixture.expectedMissingFields) {
    if (!missingFieldNames.includes(field)) {
      failures.push(`expected field missing but was not reported: ${field}`);
    }
  }

  for (const field of missingFieldNames) {
    if (!fixture.expectedMissingFields.includes(field) && !fixture.expectedPresentFields.includes(field)) {
      failures.push(`unexpected missing field reported: ${field}`);
    }
  }

  return { id: fixture.id, description: fixture.description, passed: failures.length === 0, failures };
}

async function runEvaluation() {
  console.log("Universal Intelligent Intake — Extraction Evaluation\n");

  const results = await Promise.all(fixtures.map(evaluateFixture));
  const passed = results.filter((r) => r.passed).length;
  const total = results.length;

  for (const result of results) {
    const icon = result.passed ? "✓" : "✗";
    console.log(`${icon} [${result.id}] ${result.description}`);

    if (!result.passed) {
      for (const failure of result.failures) {
        console.log(`    — ${failure}`);
      }
    }
  }

  console.log(`\n${passed}/${total} fixtures passed.`);

  if (passed < total) {
    process.exit(1);
  }
}

runEvaluation();
