import "server-only";

import { jsonSchemaOutputFormat } from "@anthropic-ai/sdk/helpers/json-schema";
import { getAnthropicClient } from "@/lib/anthropic";
import type {
  IdentityAnalysisActivity,
  IdentityAnalysisResult,
} from "@/lib/identity-analysis-contract";
import type { IdentityDimension } from "@/lib/identity-score";

const defaultIdentityModel = "claude-sonnet-4-6";

const identityAnalysisOutputSchema = {
  type: "object",
  additionalProperties: false,
  properties: {
    score: {
      type: "integer",
      minimum: 0,
      maximum: 100,
    },
    identityMix: {
      type: "array",
      minItems: 3,
      maxItems: 3,
      items: {
        type: "object",
        additionalProperties: false,
        properties: {
          dimension: {
            type: "string",
            enum: [
              "Builder",
              "Learner",
              "Creator",
              "Operator",
              "Athlete",
              "Explorer",
              "Consumer",
            ],
          },
          score: {
            type: "integer",
            minimum: 0,
            maximum: 100,
          },
        },
        required: ["dimension", "score"],
      },
    },
    observation: {
      type: "string",
      minLength: 20,
      maxLength: 320,
    },
  },
  required: ["score", "identityMix", "observation"],
} as const;

export async function generateIdentityAnalysis(
  goalIdentity: string,
  activities: IdentityAnalysisActivity[],
): Promise<IdentityAnalysisResult> {
  const client = getAnthropicClient();
  const visibleActivities = activities
    .filter((activity) => activity.appName.trim() && activity.minutes > 0)
    .sort((a, b) => b.minutes - a.minutes)
    .slice(0, 20);
  const totalVisibleMinutes = visibleActivities.reduce(
    (sum, activity) => sum + activity.minutes,
    0,
  );
  const message = await client.messages.parse(
    {
      model:
        process.env.ANTHROPIC_IDENTITY_MODEL ??
        process.env.ANTHROPIC_OBSERVATION_MODEL ??
        defaultIdentityModel,
      max_tokens: 700,
      temperature: 0,
      system: [
        "You are the Identity Compass analysis engine.",
        "Return one internally consistent identity score, identity mix, and sharp observation from visible screen-time evidence.",
        "The score measures how strongly the visible behavior supports the stated goal identity. It is not a productivity score, moral judgment, or personality assessment.",
        "Treat messaging, social, AI assistant, and browser apps as ambiguous unless their visible name clearly establishes the activity. Ambiguous time must not automatically count as aligned or misaligned.",
        "Clear goal evidence may include purpose-specific tools such as code editors, GitHub, writing tools, research tools, or fitness apps when relevant to the goal.",
        "Use this calibration: 0-20 is reserved for substantial explicit counter-aligned evidence with almost no goal evidence; 21-40 weak goal evidence with other patterns dominating; 41-60 mixed or unclear; 61-80 clear aligned evidence with meaningful competing patterns; 81-100 dominant and sustained aligned evidence. Reserve 90+ for unusually strong evidence.",
        "Ambiguous or unknown time may limit the score but cannot by itself push it below 25. Distinguish absence of visible goal evidence from explicit counterevidence.",
        "A score above 70 requires substantial, explicit goal-aligned evidence in the supplied apps. Do not award a high score merely because ambiguous apps could have been used well.",
        "Identity Mix describes behavioral patterns, not goals. Return exactly three distinct strongest dimensions. Dimension scores are evidence strengths from 0-100 and do not need to sum to 100.",
        "Use these dimensions narrowly: Builder means implementing or shipping tangible work; Learner means reading, studying, or research; Creator means writing, design, or content production; Operator means communication, coordination, or administration; Athlete means training or health activity; Explorer means navigation, travel, or real-world discovery; Consumer means passive entertainment, shopping, or scrolling.",
        "Do not infer a dimension from an unrecognized package ID or truncated app name. Unknown apps remain unknown and must not strengthen any dimension.",
        "The observation must agree with the score and mix. If the observation says goal evidence was barely visible, the score should normally be below 40. If the score is above 70, the observation must name the clear evidence supporting it.",
        "Write the observation in 25 to 35 English words. Mention at least two concrete app or duration facts. Give no advice, recommendation, question, or next step.",
        "Do not label any app inherently good or bad, and do not guess what happened inside ambiguous apps. Qualify conclusions as on-screen evidence.",
        "Prefer evidence contrast first, then a restrained, memorable screen-limited punchline.",
        "For a Founder goal, compare the combined time of the two largest apps with the clearest visible build tool. When WeChat, ChatGPT, and Codex are present, combine WeChat and ChatGPT and contrast them with Codex.",
        "Format durations over 60 minutes as hours and minutes, such as 7h 46m. Avoid loaded verbs such as consumed.",
      ].join(" "),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: JSON.stringify({
                goalIdentity,
                totalVisibleMinutes,
                activities: visibleActivities,
                styleReference:
                  "Today looked more like processing and coordinating than building: 7h 46m in WeChat and ChatGPT, versus 20 minutes in Codex. On screen, busy was obvious; building was barely visible.",
              }),
            },
          ],
        },
      ],
      output_config: {
        format: jsonSchemaOutputFormat(identityAnalysisOutputSchema),
      },
    },
    { timeout: 30_000 },
  );
  const parsedOutput = message.parsed_output;

  if (!parsedOutput) {
    throw new Error("Claude did not return an identity analysis.");
  }

  const identityMix = parsedOutput.identityMix.map((item) => ({
    dimension: item.dimension as IdentityDimension,
    score: Math.max(0, Math.min(100, Math.round(item.score))),
  }));

  if (new Set(identityMix.map((item) => item.dimension)).size !== 3) {
    throw new Error("Claude returned duplicate identity dimensions.");
  }

  return {
    score: Math.max(0, Math.min(100, Math.round(parsedOutput.score))),
    identityMix,
    observation: parsedOutput.observation.trim(),
  };
}
