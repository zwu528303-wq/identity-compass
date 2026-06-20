import type { IdentityDimension } from "@/lib/identity-score";

export type IdentityAnalysisActivity = {
  appName: string;
  minutes: number;
};

export type IdentityAnalysisMixItem = {
  dimension: IdentityDimension;
  score: number;
};

export type IdentityAnalysisResult = {
  score: number;
  identityMix: IdentityAnalysisMixItem[];
  observation: string;
};
