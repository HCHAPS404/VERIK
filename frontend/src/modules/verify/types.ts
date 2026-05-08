export type RetrievedSourceDto = {
  filename: string;
  page: number;
  chunk_index: number;
  distance: number;
  text: string;
};

export type VerifyResultDto = {
  chunk_index: number;
  chunk_text: string;
  verdict: "SOPORTADA" | "CONTRADICHA" | "NO MENCIONADA";
  justification: string;
  sources: string[];
  retrieved: RetrievedSourceDto[];
};

export type VerifySummaryDto = {
  total_chunks: number;
  supported: number;
  contradicted: number;
  not_mentioned: number;
  support_score: number;
};

export type VerifyResponseDto = {
  summary: VerifySummaryDto;
  results: VerifyResultDto[];
};

export type VerifyResult = {
  chunkIndex: number;
  chunkText: string;
  verdict: "SOPORTADA" | "CONTRADICHA" | "NO MENCIONADA";
  justification: string;
  sources: string[];
  retrieved: RetrievedSourceDto[];
};

export type VerifySummary = {
  totalChunks: number;
  supported: number;
  contradicted: number;
  notMentioned: number;
  supportScore: number;
};

export type VerifyModel = {
  summary: VerifySummary;
  results: VerifyResult[];
};

export type VerifyStreamEvent = {
  event: string;
  data: unknown;
};
