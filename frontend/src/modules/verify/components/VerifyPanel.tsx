"use client";

import { useState } from "react";

import { ApiError } from "@/core/api/errors";
import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Progress } from "@/shared/components/ui/Progress";
import { VerifyResultsTable } from "@/modules/verify/components/VerifyResultsTable";
import { VerdictDonut } from "@/modules/verify/components/VerdictDonut";
import { verifyPdf, verifyPdfStream } from "@/modules/verify/services/verify.service";
import { useVerifyStore } from "@/modules/verify/store";
import type { VerifyResult } from "@/modules/verify/types";

export function VerifyPanel() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [topK, setTopK] = useState(5);
  const [streamMode, setStreamMode] = useState(true);
  const { loading, progress, error, model, events, setLoading, setError, setModel, pushEvent, setProgress, reset } =
    useVerifyStore();

  const runVerification = async () => {
    if (!selectedFile) return;
    reset();
    setLoading(true);
    setError(null);

    try {
      if (!streamMode) {
        const data = await verifyPdf(selectedFile, topK);
        setModel(data);
        setProgress(100);
      } else {
        const accumulatedResults: VerifyResult[] = [];
        for await (const event of verifyPdfStream(selectedFile, topK)) {
          pushEvent(event);
          if (event.event === "verdict") {
            const payload = event.data as {
              chunk_index: number;
              chunk_text: string;
              verdict: "SOPORTADA" | "CONTRADICHA" | "NO MENCIONADA";
              justification: string;
              sources: string[];
            };
            accumulatedResults.push({
              chunkIndex: payload.chunk_index,
              chunkText: payload.chunk_text,
              verdict: payload.verdict,
              justification: payload.justification,
              sources: payload.sources,
              retrieved: []
            });
          }
          if (event.event === "progress") {
            const payload = event.data as { done: number; total: number };
            setProgress(Math.round((payload.done / payload.total) * 100));
          }
          if (event.event === "final") {
            const payload = event.data as {
              total_chunks: number;
              supported: number;
              contradicted: number;
              not_mentioned: number;
              support_score: number;
            };
            setModel({
              summary: {
                totalChunks: payload.total_chunks,
                supported: payload.supported,
                contradicted: payload.contradicted,
                notMentioned: payload.not_mentioned,
                supportScore: payload.support_score
              },
              results: accumulatedResults
            });
          }
        }
      }
    } catch (err) {
      const msg =
        err instanceof ApiError
          ? err.message
          : err instanceof Error
            ? err.message
            : "Error verificando documento.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Card title="Verificación documental">
        <div className="space-y-3">
          <p className="text-sm text-slate-600">Formatos admitidos: PDF o CSV (un archivo).</p>
          <input
            type="file"
            accept=".pdf,.csv,application/pdf,text/csv"
            aria-label="Seleccionar PDF o CSV para verificar"
            onChange={(event) => setSelectedFile(event.target.files?.[0] ?? null)}
            className="block w-full rounded-md border border-gov-border bg-white p-2 text-sm"
          />
          <label className="block text-sm">
            top_k:
            <input
              type="range"
              min={1}
              max={20}
              value={topK}
              onChange={(event) => setTopK(Number(event.target.value))}
              className="mx-2 align-middle"
            />
            <span>{topK}</span>
          </label>
          <label className="inline-flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={streamMode}
              onChange={(event) => setStreamMode(event.target.checked)}
            />
            Modo agéntico streaming (SSE)
          </label>
          <Button onClick={runVerification} disabled={!selectedFile || loading}>
            {loading ? "Verificando..." : "Verificar"}
          </Button>
          <Progress value={progress} />
          {error ? <p className="text-sm text-red-700">{error}</p> : null}
        </div>
      </Card>

      {model?.summary ? (
        <Card title="Resumen global">
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2 text-sm">
              <p>Total chunks: {model.summary.totalChunks}</p>
              <p>Soportadas: {model.summary.supported}</p>
              <p>Contradichas: {model.summary.contradicted}</p>
              <p>No mencionadas: {model.summary.notMentioned}</p>
              <p className="font-semibold">Score SOPORTADA: {(model.summary.supportScore * 100).toFixed(1)}%</p>
            </div>
            <VerdictDonut summary={model.summary} />
          </div>
        </Card>
      ) : null}

      {model?.results?.length ? (
        <Card title="Resultados por fragmento">
          <VerifyResultsTable results={model.results} />
        </Card>
      ) : null}

      {events.length ? (
        <Card title="Eventos de stream">
          <div className="max-h-72 overflow-auto rounded border border-gov-border bg-slate-50 p-3 text-xs" aria-live="polite">
            {events.map((event, index) => (
              <pre key={index} className="mb-2 whitespace-pre-wrap">
                {JSON.stringify(event, null, 2)}
              </pre>
            ))}
          </div>
        </Card>
      ) : null}
    </div>
  );
}
