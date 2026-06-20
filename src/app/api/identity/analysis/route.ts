import { NextResponse } from "next/server";
import { generateIdentityAnalysis } from "@/lib/identity-analysis";
import type { IdentityAnalysisActivity } from "@/lib/identity-analysis-contract";

type IdentityAnalysisRequest = {
  goalIdentity?: unknown;
  items?: unknown;
};

function isIdentityAnalysisActivity(
  value: unknown,
): value is IdentityAnalysisActivity {
  if (!value || typeof value !== "object") {
    return false;
  }

  const activity = value as Record<string, unknown>;
  return (
    typeof activity.appName === "string" &&
    activity.appName.trim().length > 0 &&
    typeof activity.minutes === "number" &&
    Number.isFinite(activity.minutes) &&
    activity.minutes >= 0 &&
    activity.minutes <= 1440
  );
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as IdentityAnalysisRequest;

    if (
      typeof body.goalIdentity !== "string" ||
      !body.goalIdentity.trim() ||
      !Array.isArray(body.items) ||
      body.items.length === 0 ||
      body.items.length > 50 ||
      !body.items.every(isIdentityAnalysisActivity)
    ) {
      return NextResponse.json(
        { error: { message: "Invalid identity analysis request." } },
        { status: 400 },
      );
    }

    const result = await generateIdentityAnalysis(
      body.goalIdentity.trim(),
      body.items,
    );

    return NextResponse.json(result);
  } catch (error) {
    console.error(
      "Identity analysis failed:",
      error instanceof Error ? error.message : "Unknown error",
    );

    return NextResponse.json(
      { error: { message: "Could not generate an identity analysis." } },
      { status: 500 },
    );
  }
}
