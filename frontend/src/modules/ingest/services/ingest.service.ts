import { apiClient } from "@/core/api/client";
import { toIngestModel } from "@/modules/ingest/mappers/ingest.mapper";
import type { IngestModel, IngestResponseDto } from "@/modules/ingest/types";

export async function ingestPdfs(files: File[]): Promise<IngestModel> {
  const formData = new FormData();
  for (const file of files) formData.append("files", file);
  const dto = await apiClient.request<IngestResponseDto>("/ingest", {
    method: "POST",
    body: formData
  });
  return toIngestModel(dto);
}
