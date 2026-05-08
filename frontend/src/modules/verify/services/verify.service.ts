import { apiClient } from "@/core/api/client";
import { parseSSE, type SseEvent } from "@/core/api/sse-client";
import { toVerifyModel } from "@/modules/verify/mappers/verify.mapper";
import type { VerifyModel, VerifyResponseDto } from "@/modules/verify/types";

export async function verifyPdf(file: File, topK = 5): Promise<VerifyModel> {
  const formData = new FormData();
  formData.append("file", file);
  const dto = await apiClient.request<VerifyResponseDto>(
    `/verify?top_k=${topK}`,
    {
      method: "POST",
      body: formData
    },
    { timeoutMs: 600000 }
  );
  return toVerifyModel(dto);
}

export async function* verifyPdfStream(file: File, topK = 5): AsyncGenerator<SseEvent> {
  const formData = new FormData();
  formData.append("file", file);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 600000);
  try {
    const response = await fetch(`/api/backend/verify/stream?top_k=${topK}`, {
      method: "POST",
      body: formData,
      signal: controller.signal
    });
    if (!response.ok) {
      const text = await response.text();
      let detail = text;
      try {
        const j = JSON.parse(text) as { detail?: string };
        if (typeof j.detail === "string") detail = j.detail;
      } catch {
        // usar texto crudo
      }
      throw new Error(detail || `Error HTTP ${response.status} al iniciar stream.`);
    }
    for await (const event of parseSSE(response)) {
      yield event;
    }
  } finally {
    clearTimeout(timeoutId);
  }
}
