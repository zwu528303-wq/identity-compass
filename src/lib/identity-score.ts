export type IdentityDimension =
  | "Builder"
  | "Learner"
  | "Creator"
  | "Operator"
  | "Athlete"
  | "Explorer"
  | "Consumer";

export type Dimension = IdentityDimension;

export type ScreenTimeSource = "screenshot" | "manual" | "api";

export type ScreenTimeItem = {
  id: string;
  appName: string;
  minutes: number;
  source: ScreenTimeSource;
  confidence?: number;
  dimensionOverride?: IdentityDimension;
};

export type Activity = ScreenTimeItem;

export type AppRule = {
  appName: string;
  aliases?: string[];
  dimension: IdentityDimension;
  appWeight: number;
  defaultPolarity: "positive" | "negative" | "ambiguous";
  confidence: "high" | "medium" | "low";
};

export type IdentityGoalName = "Founder" | "Creator" | "Scholar" | "Athlete";

export type IdentityGoal = {
  name: IdentityGoalName;
  description: string;
  antiIdentity: string;
  dimensionWeights: Record<IdentityDimension, number>;
  baselineScore: number;
  negativeScoreMultiplier: number;
};

export type ContributionItem = ScreenTimeItem & {
  dimension: IdentityDimension;
  effectiveMinutes: number;
  appWeight: number;
  contribution: number;
  polarity: "positive" | "negative" | "neutral";
  ruleAppName?: string;
  ruleConfidence: AppRule["confidence"] | "unknown";
};

export type IdentityMixItem = {
  dimension: IdentityDimension;
  score: number;
  color: string;
};

export type ScoreResult = {
  score: number;
  goal: IdentityGoal;
  identityMix: IdentityMixItem[];
  topMix: IdentityMixItem[];
  contributions: ContributionItem[];
  pullingUp: ContributionItem[];
  pullingDown: ContributionItem[];
  positiveContribution: number;
  negativeContribution: number;
};

export const dimensions: IdentityDimension[] = [
  "Builder",
  "Learner",
  "Creator",
  "Operator",
  "Athlete",
  "Explorer",
  "Consumer",
];

export const dimensionColors: Record<IdentityDimension, string> = {
  Builder: "#10a05a",
  Learner: "#7658d6",
  Creator: "#e96e2f",
  Operator: "#1d74d8",
  Athlete: "#0e9f9a",
  Explorer: "#b76c1e",
  Consumer: "#d93b4a",
};

export const goalProfiles: Record<IdentityGoalName, IdentityGoal> = {
  Founder: {
    name: "Founder",
    description: "Builds impact. Creates leverage.",
    antiIdentity: "Consumer",
    dimensionWeights: {
      Builder: 1.2,
      Operator: 0.9,
      Learner: 0.7,
      Creator: 0.5,
      Athlete: 0.4,
      Explorer: 0.3,
      Consumer: -1.4,
    },
    baselineScore: 70,
    negativeScoreMultiplier: 0.32,
  },
  Creator: {
    name: "Creator",
    description: "Publishes original work consistently.",
    antiIdentity: "Passive Consumer",
    dimensionWeights: {
      Creator: 1.2,
      Builder: 0.8,
      Learner: 0.7,
      Operator: 0.45,
      Explorer: 0.5,
      Athlete: 0.3,
      Consumer: -1.25,
    },
    baselineScore: 70,
    negativeScoreMultiplier: 0.36,
  },
  Scholar: {
    name: "Scholar",
    description: "Turns attention into deep understanding.",
    antiIdentity: "Scroller",
    dimensionWeights: {
      Learner: 1.25,
      Creator: 0.75,
      Builder: 0.55,
      Explorer: 0.4,
      Operator: 0.25,
      Athlete: 0.3,
      Consumer: -1.25,
    },
    baselineScore: 70,
    negativeScoreMultiplier: 0.36,
  },
  Athlete: {
    name: "Athlete",
    description: "Trains the body with consistency.",
    antiIdentity: "Sedentary",
    dimensionWeights: {
      Athlete: 1.35,
      Explorer: 0.5,
      Learner: 0.35,
      Builder: 0.3,
      Operator: 0.2,
      Creator: 0.2,
      Consumer: -1.2,
    },
    baselineScore: 70,
    negativeScoreMultiplier: 0.36,
  },
};

export const goals = Object.values(goalProfiles);

export const appRules: AppRule[] = [
  { appName: "Cursor", dimension: "Builder", appWeight: 1, defaultPolarity: "positive", confidence: "high" },
  { appName: "VS Code", aliases: ["Visual Studio Code"], dimension: "Builder", appWeight: 1, defaultPolarity: "positive", confidence: "high" },
  { appName: "GitHub", dimension: "Builder", appWeight: 1.8, defaultPolarity: "positive", confidence: "high" },
  { appName: "Linear", dimension: "Builder", appWeight: 0.9, defaultPolarity: "positive", confidence: "high" },
  { appName: "Figma", dimension: "Builder", appWeight: 0.95, defaultPolarity: "positive", confidence: "medium" },
  { appName: "Framer", dimension: "Builder", appWeight: 0.95, defaultPolarity: "positive", confidence: "medium" },
  { appName: "Webflow", dimension: "Builder", appWeight: 0.95, defaultPolarity: "positive", confidence: "high" },
  { appName: "Vercel", dimension: "Builder", appWeight: 0.9, defaultPolarity: "positive", confidence: "high" },
  { appName: "Supabase", dimension: "Builder", appWeight: 0.9, defaultPolarity: "positive", confidence: "high" },
  { appName: "Notion", dimension: "Builder", appWeight: 1.5, defaultPolarity: "positive", confidence: "medium" },

  { appName: "Kindle", dimension: "Learner", appWeight: 1, defaultPolarity: "positive", confidence: "high" },
  { appName: "Books", aliases: ["Apple Books"], dimension: "Learner", appWeight: 1, defaultPolarity: "positive", confidence: "high" },
  { appName: "Audible", dimension: "Learner", appWeight: 0.75, defaultPolarity: "positive", confidence: "medium" },
  { appName: "Google Scholar", dimension: "Learner", appWeight: 1.1, defaultPolarity: "positive", confidence: "high" },
  { appName: "Coursera", dimension: "Learner", appWeight: 0.9, defaultPolarity: "positive", confidence: "high" },
  { appName: "Duolingo", dimension: "Learner", appWeight: 0.65, defaultPolarity: "positive", confidence: "high" },
  { appName: "Readwise", dimension: "Learner", appWeight: 0.9, defaultPolarity: "positive", confidence: "high" },
  { appName: "ChatGPT", dimension: "Learner", appWeight: 0.85, defaultPolarity: "ambiguous", confidence: "medium" },
  { appName: "Claude", dimension: "Learner", appWeight: 0.85, defaultPolarity: "ambiguous", confidence: "medium" },
  { appName: "Perplexity", dimension: "Learner", appWeight: 0.8, defaultPolarity: "positive", confidence: "medium" },
  { appName: "Wikipedia", dimension: "Learner", appWeight: 0.7, defaultPolarity: "positive", confidence: "medium" },

  { appName: "Substack", dimension: "Creator", appWeight: 0.9, defaultPolarity: "positive", confidence: "medium" },
  { appName: "Medium", dimension: "Creator", appWeight: 0.8, defaultPolarity: "ambiguous", confidence: "medium" },
  { appName: "Canva", dimension: "Creator", appWeight: 0.9, defaultPolarity: "positive", confidence: "high" },
  { appName: "CapCut", dimension: "Creator", appWeight: 0.9, defaultPolarity: "positive", confidence: "high" },
  { appName: "Final Cut Pro", aliases: ["Final Cut"], dimension: "Creator", appWeight: 1, defaultPolarity: "positive", confidence: "high" },
  { appName: "Photoshop", dimension: "Creator", appWeight: 0.95, defaultPolarity: "positive", confidence: "high" },
  { appName: "Illustrator", dimension: "Creator", appWeight: 0.95, defaultPolarity: "positive", confidence: "high" },
  { appName: "YouTube Studio", dimension: "Creator", appWeight: 1, defaultPolarity: "positive", confidence: "high" },
  { appName: "TikTok Studio", dimension: "Creator", appWeight: 0.9, defaultPolarity: "positive", confidence: "high" },

  { appName: "Slack", dimension: "Operator", appWeight: 0.8, defaultPolarity: "positive", confidence: "high" },
  { appName: "Gmail", aliases: ["Mail"], dimension: "Operator", appWeight: 0.7, defaultPolarity: "positive", confidence: "medium" },
  { appName: "Calendar", aliases: ["Google Calendar"], dimension: "Operator", appWeight: 0.7, defaultPolarity: "positive", confidence: "high" },
  { appName: "Zoom", dimension: "Operator", appWeight: 0.75, defaultPolarity: "positive", confidence: "medium" },
  { appName: "Google Meet", aliases: ["Meet"], dimension: "Operator", appWeight: 0.75, defaultPolarity: "positive", confidence: "medium" },
  { appName: "LinkedIn", dimension: "Operator", appWeight: 0.65, defaultPolarity: "ambiguous", confidence: "medium" },
  { appName: "WhatsApp", dimension: "Operator", appWeight: 0.55, defaultPolarity: "ambiguous", confidence: "medium" },
  { appName: "WeChat", aliases: ["Wechat"], dimension: "Operator", appWeight: 0.55, defaultPolarity: "ambiguous", confidence: "medium" },
  { appName: "Telegram", dimension: "Operator", appWeight: 0.55, defaultPolarity: "ambiguous", confidence: "medium" },
  { appName: "Discord", dimension: "Consumer", appWeight: 0.8, defaultPolarity: "ambiguous", confidence: "low" },

  { appName: "Fitness", dimension: "Athlete", appWeight: 1, defaultPolarity: "positive", confidence: "high" },
  { appName: "Apple Health", aliases: ["Health"], dimension: "Athlete", appWeight: 0.9, defaultPolarity: "positive", confidence: "high" },
  { appName: "Strava", dimension: "Athlete", appWeight: 1, defaultPolarity: "positive", confidence: "high" },
  { appName: "Nike Run Club", dimension: "Athlete", appWeight: 0.95, defaultPolarity: "positive", confidence: "high" },
  { appName: "Whoop", dimension: "Athlete", appWeight: 0.9, defaultPolarity: "positive", confidence: "high" },
  { appName: "Oura", dimension: "Athlete", appWeight: 0.9, defaultPolarity: "positive", confidence: "high" },
  { appName: "MyFitnessPal", dimension: "Athlete", appWeight: 0.8, defaultPolarity: "positive", confidence: "high" },
  { appName: "Strong", dimension: "Athlete", appWeight: 0.95, defaultPolarity: "positive", confidence: "high" },
  { appName: "Peloton", dimension: "Athlete", appWeight: 0.95, defaultPolarity: "positive", confidence: "high" },
  { appName: "Fitbod", dimension: "Athlete", appWeight: 0.95, defaultPolarity: "positive", confidence: "high" },

  { appName: "Maps", aliases: ["Apple Maps"], dimension: "Explorer", appWeight: 0.7, defaultPolarity: "positive", confidence: "medium" },
  { appName: "Google Maps", dimension: "Explorer", appWeight: 0.7, defaultPolarity: "positive", confidence: "medium" },
  { appName: "Uber", dimension: "Explorer", appWeight: 0.45, defaultPolarity: "positive", confidence: "low" },
  { appName: "Lyft", dimension: "Explorer", appWeight: 0.45, defaultPolarity: "positive", confidence: "low" },
  { appName: "Airbnb", dimension: "Explorer", appWeight: 0.65, defaultPolarity: "positive", confidence: "medium" },
  { appName: "Tripadvisor", dimension: "Explorer", appWeight: 0.6, defaultPolarity: "positive", confidence: "medium" },
  { appName: "Yelp", dimension: "Explorer", appWeight: 0.45, defaultPolarity: "positive", confidence: "low" },
  { appName: "AllTrails", dimension: "Explorer", appWeight: 0.8, defaultPolarity: "positive", confidence: "medium" },
  { appName: "Translate", aliases: ["Google Translate"], dimension: "Explorer", appWeight: 0.45, defaultPolarity: "positive", confidence: "low" },
  { appName: "Weather", dimension: "Explorer", appWeight: 0.3, defaultPolarity: "positive", confidence: "low" },

  { appName: "TikTok", dimension: "Consumer", appWeight: 1.1, defaultPolarity: "negative", confidence: "high" },
  { appName: "Instagram", dimension: "Consumer", appWeight: 1, defaultPolarity: "ambiguous", confidence: "medium" },
  { appName: "YouTube", dimension: "Consumer", appWeight: 1.2, defaultPolarity: "ambiguous", confidence: "medium" },
  { appName: "Netflix", dimension: "Consumer", appWeight: 1, defaultPolarity: "negative", confidence: "high" },
  { appName: "Disney+", aliases: ["Disney Plus"], dimension: "Consumer", appWeight: 1, defaultPolarity: "negative", confidence: "high" },
  { appName: "Hulu", dimension: "Consumer", appWeight: 1, defaultPolarity: "negative", confidence: "high" },
  { appName: "Reddit", dimension: "Consumer", appWeight: 0.95, defaultPolarity: "ambiguous", confidence: "medium" },
  { appName: "X", aliases: ["Twitter"], dimension: "Consumer", appWeight: 0.9, defaultPolarity: "ambiguous", confidence: "medium" },
  { appName: "Facebook", dimension: "Consumer", appWeight: 0.8, defaultPolarity: "ambiguous", confidence: "medium" },
  { appName: "Snapchat", dimension: "Consumer", appWeight: 0.9, defaultPolarity: "negative", confidence: "high" },
];

export const defaultScreenTimeItems: ScreenTimeItem[] = [
  { id: "cursor", appName: "Cursor", minutes: 102, source: "screenshot", confidence: 0.96 },
  { id: "github", appName: "GitHub", minutes: 36, source: "screenshot", confidence: 0.94 },
  { id: "notion", appName: "Notion", minutes: 28, source: "screenshot", confidence: 0.89 },
  { id: "instagram", appName: "Instagram", minutes: 131, source: "screenshot", confidence: 0.92 },
  { id: "youtube", appName: "YouTube", minutes: 65, source: "screenshot", confidence: 0.9 },
  { id: "tiktok", appName: "TikTok", minutes: 45, source: "screenshot", confidence: 0.91 },
];

export const defaultActivities = defaultScreenTimeItems;

const maxEffectiveMinutes = 120;

const appRuleIndex = new Map<string, AppRule>();

for (const rule of appRules) {
  appRuleIndex.set(normalizeAppName(rule.appName), rule);

  for (const alias of rule.aliases ?? []) {
    appRuleIndex.set(normalizeAppName(alias), rule);
  }
}

const mixWeights: Record<IdentityDimension, Partial<Record<IdentityDimension, number>>> = {
  Builder: {
    Builder: 0.78,
    Learner: 0.16,
    Creator: 0.08,
  },
  Learner: {
    Learner: 0.72,
    Builder: 0.16,
  },
  Creator: {
    Creator: 0.72,
    Operator: 0.12,
    Consumer: 0.08,
  },
  Operator: {
    Operator: 0.78,
    Creator: 0.12,
  },
  Athlete: {
    Athlete: 0.86,
  },
  Explorer: {
    Explorer: 0.8,
    Learner: 0.14,
  },
  Consumer: {
    Consumer: 0.78,
    Creator: 0.14,
    Learner: 0.08,
  },
};

const mixThresholds: Record<IdentityDimension, number> = {
  Builder: 86,
  Learner: 54,
  Creator: 70,
  Operator: 92,
  Athlete: 92,
  Explorer: 92,
  Consumer: 110,
};

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function normalizeAppName(appName: string) {
  return appName.toLowerCase().replace(/\s+/g, " ").trim();
}

function getGoal(goalName: string): IdentityGoal {
  return goalProfiles[goalName as IdentityGoalName] ?? goalProfiles.Founder;
}

function getEffectiveMinutes(minutes: number) {
  return clamp(Math.round(minutes), 0, maxEffectiveMinutes);
}

function getFallbackWeight(dimension: IdentityDimension) {
  return dimension === "Consumer" ? 0.5 : 0.6;
}

export function findAppRule(appName: string) {
  return appRuleIndex.get(normalizeAppName(appName)) ?? null;
}

export function getResolvedDimension(item: ScreenTimeItem) {
  return item.dimensionOverride ?? findAppRule(item.appName)?.dimension ?? "Consumer";
}

export function formatDuration(minutes: number) {
  const safeMinutes = Math.max(0, Math.round(minutes));
  const hours = Math.floor(safeMinutes / 60);
  const rest = safeMinutes % 60;

  if (hours === 0) {
    return `${rest}m`;
  }

  if (rest === 0) {
    return `${hours}h`;
  }

  return `${hours}h ${rest}m`;
}

export function getContributions(
  items: ScreenTimeItem[],
  goalName = "Founder",
): ContributionItem[] {
  const goal = getGoal(goalName);

  return items
    .map((item) => {
      const rule = findAppRule(item.appName);
      const dimension = getResolvedDimension(item);
      const effectiveMinutes = getEffectiveMinutes(item.minutes);
      const appWeight =
        item.dimensionOverride && item.dimensionOverride !== rule?.dimension
          ? Math.min(rule?.appWeight ?? getFallbackWeight(dimension), 0.8)
          : rule?.appWeight ?? getFallbackWeight(dimension);
      const contribution = Math.round(
        (effectiveMinutes / 10) * goal.dimensionWeights[dimension] * appWeight,
      );
      const polarity: ContributionItem["polarity"] =
        contribution > 0 ? "positive" : contribution < 0 ? "negative" : "neutral";

      return {
        ...item,
        dimension,
        effectiveMinutes,
        appWeight,
        contribution,
        polarity,
        ruleAppName: rule?.appName,
        ruleConfidence: (rule?.confidence ?? "unknown") as ContributionItem["ruleConfidence"],
      };
    })
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
}

export function getIdentityMix(items: ScreenTimeItem[]) {
  const rawScores = dimensions.reduce(
    (scores, dimension) => ({ ...scores, [dimension]: 0 }),
    {} as Record<IdentityDimension, number>,
  );

  for (const item of items) {
    const dimension = getResolvedDimension(item);
    const weights = mixWeights[dimension];
    const minutes = getEffectiveMinutes(item.minutes);

    for (const [weightedDimension, weight] of Object.entries(weights)) {
      rawScores[weightedDimension as IdentityDimension] += minutes * (weight ?? 0);
    }
  }

  return dimensions.map((dimension) => {
    const score = clamp(
      Math.round(
        100 * (1 - Math.exp(-rawScores[dimension] / mixThresholds[dimension])),
      ),
      0,
      100,
    );

    return {
      dimension,
      score,
      color: dimensionColors[dimension],
    };
  });
}

export function getTopConstructiveMix(items: ScreenTimeItem[], count = 3) {
  return getIdentityMix(items)
    .filter((item) => item.dimension !== "Consumer")
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}

export function calculateIdentityScore(
  items: ScreenTimeItem[],
  goalName = "Founder",
): ScoreResult {
  const goal = getGoal(goalName);
  const contributions = getContributions(items, goal.name);
  const positiveContribution = contributions
    .filter((item) => item.contribution > 0)
    .reduce((sum, item) => sum + item.contribution, 0);
  const negativeContribution = contributions
    .filter((item) => item.contribution < 0)
    .reduce((sum, item) => sum + item.contribution, 0);
  const score = clamp(
    Math.round(
      goal.baselineScore +
        positiveContribution +
        negativeContribution * goal.negativeScoreMultiplier,
    ),
    0,
    100,
  );
  const identityMix = getIdentityMix(items);

  return {
    score,
    goal,
    identityMix,
    topMix: getTopConstructiveMix(items),
    contributions,
    pullingUp: contributions.filter((item) => item.contribution > 0).slice(0, 3),
    pullingDown: contributions
      .filter((item) => item.contribution < 0)
      .slice(0, 3),
    positiveContribution,
    negativeContribution,
  };
}

export function getScore(items: ScreenTimeItem[], goalName = "Founder") {
  return calculateIdentityScore(items, goalName).score;
}
