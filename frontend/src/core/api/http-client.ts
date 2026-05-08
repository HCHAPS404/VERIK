import { ApiError } from "@/core/api/errors";

export class HttpClient {
  constructor(
    private readonly baseUrl: string,
    private readonly timeoutMs: number = 30000
  ) {}

  async request<T>(path: string, init: RequestInit = {}, retries = 1): Promise<T> {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);
    try {
      const response = await fetch(`${this.baseUrl}${path}`, {
        ...init,
        signal: controller.signal
      });

      if (!response.ok) {
        const maybeJson = await response.text();
        const message = maybeJson || `Error HTTP ${response.status}`;
        if (response.status >= 500 && retries > 0) {
          await new Promise((resolve) => setTimeout(resolve, 400));
          return this.request<T>(path, init, retries - 1);
        }
        throw new ApiError(message, response.status);
      }

      return (await response.json()) as T;
    } catch (error) {
      if (error instanceof ApiError) throw error;
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
