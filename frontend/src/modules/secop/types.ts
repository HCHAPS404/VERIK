export type NumericStatsDto = {
  min: string | null;
  max: string | null;
  mean: string | null;
  median: string | null;
};

export type SecopSummaryDto = {
  dataset: "jbjy-vk9h" | "dmgg-8hin";
  total_records: number;
  total_columns: number;
  null_counts: Record<string, number>;
  int_columns: string[];
  str_columns: string[];
  date_range: {
    min: string | null;
    max: string | null;
  };
  numeric_stats: Record<string, NumericStatsDto>;
  lookup_sample: {
    id_column: string;
    id_value: number;
    row: Record<string, string> | null;
  } | null;
};

export type SecopSummaryModel = {
  dataset: "jbjy-vk9h" | "dmgg-8hin";
  totalRecords: number;
  totalColumns: number;
  nullCounts: Array<{ column: string; count: number }>;
  intColumns: string[];
  strColumns: string[];
  dateRange: {
    min: string | null;
    max: string | null;
  };
  numericStats: Array<{
    column: string;
    min: string | null;
    max: string | null;
    mean: string | null;
    median: string | null;
  }>;
  lookupSample: {
    idColumn: string;
    idValue: number;
    row: Record<string, string> | null;
  } | null;
};
