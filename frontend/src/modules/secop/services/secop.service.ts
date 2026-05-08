import { apiClient } from "@/core/api/client";
import { toSecopSummaryModel } from "@/modules/secop/mappers/secop.mapper";
import type { SecopSummaryDto, SecopSummaryModel } from "@/modules/secop/types";

export type SecopDataset = "jbjy-vk9h" | "dmgg-8hin";

export async function getSecopSummary(dataset: SecopDataset): Promise<SecopSummaryModel> {
  const dto = await apiClient.request<SecopSummaryDto>(`/secop/summary?dataset=${dataset}`);
  return toSecopSummaryModel(dto);
}

export function getSecopExportUrl(dataset: SecopDataset, format: "json" | "csv"): string {
  return `/api/backend/secop/export?dataset=${dataset}&format=${format}`;
}
