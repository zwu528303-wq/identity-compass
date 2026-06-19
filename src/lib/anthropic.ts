import Anthropic from "@anthropic-ai/sdk";

let anthropicClient: Anthropic | null = null;

export function getAnthropicClient() {
  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    throw new Error(
      "ANTHROPIC_API_KEY is missing. Add it to .env.local before analyzing screenshots.",
    );
  }

  if (!anthropicClient) {
    anthropicClient = new Anthropic({ apiKey });
  }

  return anthropicClient;
}
