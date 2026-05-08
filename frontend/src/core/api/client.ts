import { HttpClient } from "@/core/api/http-client";
import { env } from "@/core/config/env";

/** Timeout por defecto alto: ingesta/embeddings pueden tardar varios minutos. */
export const apiClient = new HttpClient("/api/backend", 120000);
export const externalApiClient = new HttpClient(env.NEXT_PUBLIC_API_BASE_URL);
