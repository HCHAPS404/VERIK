import type { SecopSummaryDto, SecopSummaryModel } from "@/modules/secop/types";

export function toSecopSummaryModel(dto: SecopSummaryDto): SecopSummaryModel {
  return {
    dataset: dto.dataset,
    totalRecords: dto.total_records,
    totalColumns: dto.total_columns,
    nullCounts: Object.entries(dto.null_counts).map(([column, count]) => ({ column, count })),
    intColumns: dto.int_columns,
    strColumns: dto.str_columns,
    dateRange: dto.date_range,
    numericStats: Object.entries(dto.numeric_stats).map(([column, stats]) => ({
      column,
      min: stats.min,
      max: stats.max,
      mean: stats.mean,
      median: stats.median
    })),
    lookupSample: dto.lookup_sample
      ? {
          idColumn: dto.lookup_sample.id_column,
          idValue: dto.lookup_sample.id_value,
          row: dto.lookup_sample.row
        }
      : null
  };
}
