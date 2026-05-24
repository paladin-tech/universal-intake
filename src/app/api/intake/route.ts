import { NextResponse } from "next/server";
import { z } from "zod";
import { runIntake } from "@/lib/intake/orchestrator";

const intakeRequestSchema = z.object({
  workflowId: z.string().min(1),
  input: z.string().min(1),
  metadata: z.record(z.unknown()).optional(),
});

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  const parsed = intakeRequestSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: "Invalid intake request.",
        issues: parsed.error.issues.map((issue) => ({ path: issue.path, message: issue.message })),
      },
      { status: 400 },
    );
  }

  const result = await runIntake(parsed.data);
  const status = result.status === "invalid" ? 400 : 200;

  return NextResponse.json(result, { status });
}
