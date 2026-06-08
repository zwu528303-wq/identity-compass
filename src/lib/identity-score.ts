export type Dimension =
  | "Builder"
  | "Learner"
  | "Creator"
  | "Connector"
  | "Athlete"
  | "Explorer"
  | "Consumer";

export type Activity = {
  id: string;
  app: string;
  minutes: number;
  primaryDimension: Dimension;
};

export type IdentityGoal = {
  name: string;
  description: string;
  antiIdentity: string;
};

export type Contribution = Activity & {
  contribution: number;
};

export type IdentityMixItem = {
  dimension: Dimension;
  score: number;
  color: string;
};

export const dimensions: Dimension[] = [
  "Builder",
  "Learner",
  "Creator",
  "Connector",
  "Athlete",
  "Explorer",
  "Consumer",
];

export const goals: IdentityGoal[] = [
  {
    name: "Founder",
    description: "Builds impact. Creates leverage.",
    antiIdentity: "Consumer",
  },
  {
    name: "AI Builder",
    description: "Ships useful AI-powered artifacts.",
    antiIdentity: "AI Tourist",
  },
  {
    name: "Creator",
    description: "Publishes original work consistently.",
    antiIdentity: "Passive Consumer",
  },
  {
    name: "Scholar",
    description: "Turns attention into deep understanding.",
    antiIdentity: "Scroller",
  },
  {
    name: "Athlete",
    description: "Trains the body with consistency.",
    antiIdentity: "Sedentary",
  },
];

export const defaultActivities: Activity[] = [
  { id: "cursor", app: "Cursor", minutes: 102, primaryDimension: "Builder" },
  { id: "github", app: "GitHub", minutes: 36, primaryDimension: "Builder" },
  { id: "notion", app: "Notion", minutes: 28, primaryDimension: "Learner" },
  {
    id: "instagram",
    app: "Instagram",
    minutes: 131,
    primaryDimension: "Consumer",
  },
  { id: "youtube", app: "YouTube", minutes: 65, primaryDimension: "Consumer" },
  { id: "tiktok", app: "TikTok", minutes: 45, primaryDimension: "Consumer" },
];

const dimensionColors: Record<Dimension, string> = {
  Builder: "#10a05a",
  Learner: "#7658d6",
  Creator: "#e96e2f",
  Connector: "#1d74d8",
  Athlete: "#0e9f9a",
  Explorer: "#b76c1e",
  Consumer: "#d93b4a",
};

const contributionRateByDimension: Record<Dimension, number> = {
  Builder: 0.13,
  Learner: 0.09,
  Creator: 0.08,
  Connector: 0.07,
  Athlete: 0.08,
  Explorer: 0.07,
  Consumer: -0.14,
};

const knownAppRates: Record<string, number> = {
  cursor: 0.12,
  github: 0.22,
  notion: 0.18,
  instagram: -0.14,
  youtube: -0.17,
  tiktok: -0.16,
  x: -0.12,
  twitter: -0.12,
  reddit: -0.13,
  slack: 0.04,
  chatgpt: 0.1,
  claude: 0.1,
  perplexity: 0.08,
  safari: -0.03,
};

const mixWeights: Record<Dimension, Partial<Record<Dimension, number>>> = {
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
    Connector: 0.12,
    Consumer: 0.08,
  },
  Connector: {
    Connector: 0.78,
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

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function appKey(app: string) {
  return app.toLowerCase().trim();
}

function contributionFor(activity: Activity) {
  const appRate = knownAppRates[appKey(activity.app)];
  const rate = appRate ?? contributionRateByDimension[activity.primaryDimension];
  return Math.round(activity.minutes * rate);
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

export function getScore(activities: Activity[]) {
  if (activities.length === 0) {
    return 0;
  }

  const totalMinutes = activities.reduce((sum, activity) => sum + activity.minutes, 0);

  if (totalMinutes <= 0) {
    return 0;
  }

  const contributions = activities.map(contributionFor);
  const positive = contributions
    .filter((contribution) => contribution > 0)
    .reduce((sum, contribution) => sum + contribution, 0);
  const negative = contributions
    .filter((contribution) => contribution < 0)
    .reduce((sum, contribution) => sum + contribution, 0);

  const baseline = 71;
  const score = baseline + positive + negative * 0.32;

  return clamp(Math.round(score), 0, 100);
}

export function getContributions(activities: Activity[]) {
  return activities
    .map((activity) => ({
      ...activity,
      contribution: contributionFor(activity),
    }))
    .sort((a, b) => Math.abs(b.contribution) - Math.abs(a.contribution));
}

export function getIdentityMix(activities: Activity[]) {
  const rawScores = dimensions.reduce(
    (scores, dimension) => ({ ...scores, [dimension]: 0 }),
    {} as Record<Dimension, number>,
  );

  for (const activity of activities) {
    const weights = mixWeights[activity.primaryDimension];

    for (const [dimension, weight] of Object.entries(weights)) {
      rawScores[dimension as Dimension] += activity.minutes * (weight ?? 0);
    }
  }

  return dimensions.map((dimension) => {
    const thresholds: Record<Dimension, number> = {
      Builder: 86,
      Learner: 64,
      Creator: 70,
      Connector: 92,
      Athlete: 92,
      Explorer: 92,
      Consumer: 110,
    };
    const score = clamp(
      Math.round(
        100 * (1 - Math.exp(-rawScores[dimension] / thresholds[dimension])),
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

export function getTopConstructiveMix(activities: Activity[], count = 3) {
  return getIdentityMix(activities)
    .filter((item) => item.dimension !== "Consumer")
    .sort((a, b) => b.score - a.score)
    .slice(0, count);
}
