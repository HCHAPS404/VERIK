import { HttpClient } from "@/core/api/http-client";
import { env } from "@/core/config/env";

export const apiClient = new HttpClient("/api/backend");
export const externalApiClient = new HttpClient(env.NEXT_PUBLIC_API_BASE_URL);
