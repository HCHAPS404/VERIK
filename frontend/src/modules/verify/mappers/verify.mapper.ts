import type {
  VerifyModel,
  VerifyResponseDto,
  VerifyResult,
  VerifyResultDto,
  VerifySummary,
  VerifySummaryDto
} from "@/modules/verify/types";

export function toVerifySummary(dto: VerifySummaryDto): VerifySummary {
  return {
    totalChunks: dto.total_chunks,
    supported: dto.supported,
    contradicted: dto.contradicted,
    notMentioned: dto.not_mentioned,
    supportScore: dto.support_score
  };
}

export function toVerifyResult(dto: VerifyResultDto): VerifyResult {
  return {
    chunkIndex: dto.chunk_index,
    chunkText: dto.chunk_text,
    verdict: dto.verdict,
    justification: dto.justification,
    sources: dto.sources,
    retrieved: dto.retrieved
  };
}

export function toVerifyModel(dto: VerifyResponseDto): VerifyModel {
  return {
    summary: toVerifySummary(dto.summary),
    results: dto.results.map(toVerifyResult)
  };
}
