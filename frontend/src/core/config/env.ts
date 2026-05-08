import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_BASE_URL: z.string().default("http://127.0.0.1:8001"),
  NEXT_PUBLIC_FEATURE_INGEST: z.string().default("true"),
  NEXT_PUBLIC_FEATURE_VERIFY: z.string().default("true"),
  NEXT_PUBLIC_FEATURE_VERIFY_STREAM: z.string().default("true"),
  NEXT_PUBLIC_FEATURE_CHARTS: z.string().default("true")
});

export const env = envSchema.parse({
  NEXT_PUBLIC_API_BASE_URL: process.env.NEXT_PUBLIC_API_BASE_URL,
  NEXT_PUBLIC_FEATURE_INGEST: process.env.NEXT_PUBLIC_FEATURE_INGEST,
  NEXT_PUBLIC_FEATURE_VERIFY: process.env.NEXT_PUBLIC_FEATURE_VERIFY,
  NEXT_PUBLIC_FEATURE_VERIFY_STREAM: process.env.NEXT_PUBLIC_FEATURE_VERIFY_STREAM,
  NEXT_PUBLIC_FEATURE_CHARTS: process.env.NEXT_PUBLIC_FEATURE_CHARTS
});
