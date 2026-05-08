import type { IngestModel, IngestResponseDto } from "@/modules/ingest/types";

export function toIngestModel(dto: IngestResponseDto): IngestModel {
  return {
    files: dto.indexed_files,
    totalChunks: dto.total_chunks,
    collection: dto.collection
  };
}
