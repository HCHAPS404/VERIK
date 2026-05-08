import { apiClient } from "@/core/api/client";

export type StatsDto = {
  total_chunks: number;
  total_files: number;
  files: string[];
};

export type StatsModel = {
  totalChunks: number;
  totalFiles: number;
  files: string[];
};

export async function getStats(): Promise<StatsModel> {
  const dto = await apiClient.request<StatsDto>("/stats");
  return {
    totalChunks: dto.total_chunks,
    totalFiles: dto.total_files,
    files: dto.files
  };
}
