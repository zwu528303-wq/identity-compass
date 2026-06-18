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

const mockParsedItems: ParsedScreenTimeItem[] = [
  {
    id: "parsed_cursor",
    appName: "Cursor",
    minutes: 102,
    originalText: "Cursor 1h 42m",
    confidence: 0.96,
  },
  {
    id: "parsed_github",
    appName: "GitHub",
    minutes: 36,
    originalText: "GitHub 36m",
    confidence: 0.94,
  },
  {
    id: "parsed_notion",
    appName: "Notion",
    minutes: 28,
    originalText: "Notion 28m",
    confidence: 0.89,
  },
  {
    id: "parsed_instagram",
    appName: "Instagram",
    minutes: 131,
    originalText: "Instagram 2h 11m",
    confidence: 0.92,
  },
  {
    id: "parsed_youtube",
    appName: "YouTube",
    minutes: 65,
    originalText: "YouTube 1h 05m",
    confidence: 0.9,
  },
  {
    id: "parsed_tiktok",
    appName: "TikTok",
    minutes: 45,
    originalText: "TikTok 45m",
    confidence: 0.91,
  },
];

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
  if (!file.type.startsWith("image/")) {
    return createError("INVALID_IMAGE", "Please upload an image file.");
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

  // Placeholder for the real vision/OCR model call. The API contract is stable;
  // only this implementation needs to change when OpenAI Vision is connected.
  await file.arrayBuffer();

  return {
    importId: crypto.randomUUID(),
    date: new Date().toISOString().slice(0, 10),
    platform: "ios_screen_time",
    items: mockParsedItems,
    warnings: [],
  };
}
