"use client";

import { useState } from "react";

import { Button } from "@/shared/components/ui/Button";
import { Card } from "@/shared/components/ui/Card";
import { Table } from "@/shared/components/ui/Table";
import { ingestPdfs } from "@/modules/ingest/services/ingest.service";
import { useIngestStore } from "@/modules/ingest/store";

export function IngestPanel() {
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const { loading, error, result, setLoading, setError, setResult } = useIngestStore();

  const onSubmit = async () => {
    if (!selectedFiles.length) return;
    setLoading(true);
    setError(null);
    try {
      const data = await ingestPdfs(selectedFiles);
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error inesperado durante la ingesta.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card title="Ingesta de documentos base">
      <div className="space-y-4">
        <input
          type="file"
          accept="application/pdf"
          multiple
          aria-label="Seleccionar PDFs base"
          onChange={(event) => setSelectedFiles(Array.from(event.target.files ?? []))}
          className="block w-full rounded-md border border-gov-border bg-white p-2 text-sm"
        />
        <Button onClick={onSubmit} disabled={loading || selectedFiles.length === 0}>
          {loading ? "Indexando..." : "Indexar documentos"}
        </Button>
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
        {result ? (
          <div className="space-y-3">
            <p className="text-sm">
              Colección: <strong>{result.collection}</strong> | Total chunks: <strong>{result.totalChunks}</strong>
            </p>
            <Table
              headers={["Archivo", "Páginas", "Chunks"]}
              rows={result.files.map((file) => [file.filename, file.pages, file.chunks])}
            />
          </div>
        ) : null}
      </div>
    </Card>
  );
}
