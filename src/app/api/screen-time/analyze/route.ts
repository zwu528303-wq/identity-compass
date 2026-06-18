import { NextResponse } from "next/server";
import {
  analyzeScreenTimeScreenshot,
  type AnalyzeScreenTimeError,
} from "@/lib/screen-time-parser";

function isFile(value: FormDataEntryValue | null): value is File {
  return value instanceof File;
}

function errorResponse(error: AnalyzeScreenTimeError, status = 400) {
  return NextResponse.json(error, { status });
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const screenshot = formData.get("screenshot");

    if (!isFile(screenshot)) {
      return errorResponse({
        error: {
          code: "INVALID_IMAGE",
          message: "Missing Screen Time screenshot.",
        },
      });
    }

    const result = await analyzeScreenTimeScreenshot(screenshot);

    if ("error" in result) {
      return errorResponse(result);
    }

    return NextResponse.json(result);
  } catch {
    return errorResponse(
      {
        error: {
          code: "MODEL_PARSE_FAILED",
          message: "Could not parse this screenshot.",
        },
      },
      500,
    );
  }
}
