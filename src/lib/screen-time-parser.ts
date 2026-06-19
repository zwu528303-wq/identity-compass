import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import { getAnthropicClient } from "@/lib/anthropic";

export type ParsedScreenTimeItem = {
  id: string;
  appName: string;
  minutes: number;
  originalText?: string;
  confidence: number;
};

export type AnalyzeScreenTimeResponse = {
  importId: string;
  date?: string;
  platform: "ios_screen_time" | "unknown";
  items: ParsedScreenTimeItem[];
  warnings: string[];
};

export type AnalyzeScreenTimeErrorCode =
  | "INVALID_IMAGE"
  | "FILE_TOO_LARGE"
  | "NO_SCREEN_TIME_DATA"
  | "MODEL_PARSE_FAILED";

export type AnalyzeScreenTimeError = {
  error: {
    code: AnalyzeScreenTimeErrorCode;
    message: string;
  };
};

const maxUploadBytes = 8 * 1024 * 1024;
const defaultScreenTimeModel = "claude-haiku-4-5-20251001";

type SupportedImageMediaType =
  | "image/jpeg"
  | "image/png"
  | "image/gif"
  | "image/webp";

const supportedImageMediaTypes = new Set<SupportedImageMediaType>([
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
]);

const screenTimeOutputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    platform: {
      type: "string",
      enum: ["ios_screen_time", "unknown"],
    },
    date: {
      type: "string",
      description: "Date shown in the screenshot as YYYY-MM-DD, or an empty string.",
    },
    items: {
      type: "array",
      maxItems: 50,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          appName: { type: "string" },
          minutes: { type: "integer", minimum: 0, maximum: 1440 },
          originalText: { type: "string" },
          confidence: { type: "number", minimum: 0, maximum: 1 },
        },
        required: ["appName", "minutes", "originalText", "confidence"],
      },
    },
    warnings: {
      type: "array",
      maxItems: 10,
      items: { type: "string" },
    },
  },
  required: ["platform", "date", "items", "warnings"],
} as const;

function createError(
  code: AnalyzeScreenTimeErrorCode,
  message: string,
): AnalyzeScreenTimeError {
  return {
    error: {
      code,
      message,
    },
  };
}

export function validateScreenTimeImage(file: File) {
  if (!supportedImageMediaTypes.has(file.type as SupportedImageMediaType)) {
    return createError(
      "INVALID_IMAGE",
      "Please upload a PNG, JPEG, GIF, or WebP image.",
    );
  }

  if (file.size > maxUploadBytes) {
    return createError("FILE_TOO_LARGE", "Image must be smaller than 8MB.");
  }

  return null;
}

export async function analyzeScreenTimeScreenshot(
  file: File,
): Promise<AnalyzeScreenTimeResponse | AnalyzeScreenTimeError> {
  const validationError = validateScreenTimeImage(file);

  if (validationError) {
    return validationError;
  }

  const client = getAnthropicClient();
  const imageData = Buffer.from(await file.arrayBuffer()).toString("base64");
  const message = await client.messages.parse(
    {
      model: process.env.ANTHROPIC_SCREEN_TIME_MODEL ?? defaultScreenTimeModel,
      max_tokens: 2500,
      temperature: 0,
      system:
        "You are a precise OCR and data extraction engine. Extract only information visible in the screenshot. Never classify apps, infer identity dimensions, calculate a score, or invent rows that are not visible.",
      messages: [
        {
          role: "user",
          content: [
            {
              type: "image",
              source: {
                type: "base64",
                media_type: file.type as SupportedImageMediaType,
                data: imageData,
              },
            },
            {
              type: "text",
              text: [
                "Extract the individual app usage rows from this Screen Time screenshot.",
                "Ignore total or summary rows such as All Usage, Total Screen Time, and category totals.",
                "Convert durations to whole minutes. Keep app names exactly as displayed, including package IDs or truncation when the full name is not visible.",
                "Do not infer rows below the crop. Add a warning when the screenshot appears cropped or some names are truncated.",
                "Return an empty items array if no individual app rows are visible.",
              ].join(" "),
            },
          ],
        },
      ],
      output_config: {
        format: jsonSchemaOutputFormat(screenTimeOutputSchema),
      },
    },
    { timeout: 30_000 },
  );
  const parsedOutput = message.parsed_output;

  if (!parsedOutput || parsedOutput.items.length === 0) {
    return createError(
      "NO_SCREEN_TIME_DATA",
      "No individual app usage rows were found in this screenshot.",
    );
  }

  const items = parsedOutput.items
    .map((item) => ({
      id: `parsed_${crypto.randomUUID()}`,
      appName: item.appName.trim(),
      minutes: Math.max(0, Math.min(1440, Math.round(item.minutes))),
      originalText: item.originalText.trim() || undefined,
      confidence: Math.max(0, Math.min(1, item.confidence)),
    }))
    .filter((item) => item.appName.length > 0 && item.minutes > 0);

  if (items.length === 0) {
    return createError(
      "NO_SCREEN_TIME_DATA",
      "No valid app usage rows were found in this screenshot.",
    );
  }

  return {
    importId: crypto.randomUUID(),
    date: parsedOutput.date.trim() || undefined,
    platform: parsedOutput.platform,
    items,
    warnings: parsedOutput.warnings.map((warning) => warning.trim()).filter(Boolean),
  };
}
