import { apiClient } from "@/core/api/client";
import { parseSSE, type SseEvent } from "@/core/api/sse-client";
import { toVerifyModel } from "@/modules/verify/mappers/verify.mapper";
import type { VerifyModel, VerifyResponseDto } from "@/modules/verify/types";

export async function verifyPdf(file: File, topK = 5): Promise<VerifyModel> {
  const formData = new FormData();
  formData.append("file", file);
  const dto = await apiClient.request<VerifyResponseDto>(`/verify?top_k=${topK}`, {
    method: "POST",
    body: formData
  });
  return toVerifyModel(dto);
}

export async function* verifyPdfStream(file: File, topK = 5): AsyncGenerator<SseEvent> {
  const formData = new FormData();
  formData.append("file", file);
  const response = await fetch(`/api/backend/verify/stream?top_k=${topK}`, {
    method: "POST",
    body: formData
  });
  if (!response.ok) {
    throw new Error(`Error HTTP ${response.status} al iniciar stream.`);
  }
  for await (const event of parseSSE(response)) {
    yield event;
  }
}
