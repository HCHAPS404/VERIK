import { describe, expect, it } from "vitest";

import { toVerifyModel } from "@/modules/verify/mappers/verify.mapper";

describe("verify mapper", () => {
  it("mapea dto a modelo interno", () => {
    const model = toVerifyModel({
      summary: {
        total_chunks: 2,
        supported: 1,
        contradicted: 1,
        not_mentioned: 0,
        support_score: 0.5
      },
      results: [
        {
          chunk_index: 0,
          chunk_text: "x",
          verdict: "SOPORTADA",
          justification: "ok",
          sources: ["f1"],
          retrieved: []
        }
      ]
    });

    expect(model.summary.totalChunks).toBe(2);
    expect(model.results[0].chunkIndex).toBe(0);
  });
});
