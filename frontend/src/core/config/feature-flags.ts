import { env } from "@/core/config/env";

export const featureFlags = {
  ingest: env.NEXT_PUBLIC_FEATURE_INGEST !== "false",
  verify: env.NEXT_PUBLIC_FEATURE_VERIFY !== "false",
  verifyStream: env.NEXT_PUBLIC_FEATURE_VERIFY_STREAM !== "false",
  dashboardCharts: env.NEXT_PUBLIC_FEATURE_CHARTS !== "false"
} as const;
