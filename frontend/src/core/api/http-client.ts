import { ApiError } from "@/core/api/errors";

export type RequestOptions = {
  retries?: number;
  timeoutMs?: number;
};

function parseFastApiDetail(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return "";
  try {
    const parsed = JSON.parse(trimmed) as { detail?: unknown };
    if (typeof parsed.detail === "string") return parsed.detail;
    if (Array.isArray(parsed.detail)) {
      return parsed.detail
        .map((item) => {
          if (item && typeof item === "object" && "msg" in item) {
            return String((item as { msg?: string }).msg ?? JSON.stringify(item));
          }
          return JSON.stringify(item);
        })
        .join("; ");
    }
    if (parsed.detail != null) return JSON.stringify(parsed.detail);
  } catch {
    // no es JSON
  }
  return trimmed;
}

export class HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly defaultTimeoutMs: number = 120000
  ) {}

  async request<T>(path: string, init: RequestInit = {}, options: RequestOptions = {}): Promise<T> {
    const retries = options.retries ?? 1;
    const timeoutMs = options.timeoutMs ?? this.defaultTimeoutMs;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal
      });

      if (!response.ok) {
        const bodyText = await response.text();
        const parsed = parseFastApiDetail(bodyText);
        const message = parsed || `Error HTTP ${response.status}`;
        if (response.status >= 500 && retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 400));
          return this.request<T>(path, init, { ...options, retries: retries - 1 });
        }
        throw new ApiError(message, response.status);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
      if (error instanceof Error && error.name === "AbortError") {
        throw new ApiError(
          "Tiempo de espera agotado. Reduce el tamano del archivo o aumenta el timeout en el cliente.",
          0,
          "TIMEOUT"
        );
      }
      throw new ApiError(
        error instanceof Error ? error.message : "Error de red no identificado",
        0,
        "NETWORK_ERROR"
      );
    } finally {
      clearTimeout(timeoutId);
    }
  }
}
