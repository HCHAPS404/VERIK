"use client";

import { useEffect, useMemo, useState } from "react";

import { ApiError } from "@/core/api/errors";
import { getSecopExportUrl, getSecopSummary, type SecopDataset } from "@/modules/secop/services/secop.service";
import type { SecopSummaryModel } from "@/modules/secop/types";
import { Card } from "@/shared/components/ui/Card";
import { Table } from "@/shared/components/ui/Table";

const DATASET_LABEL: Record<SecopDataset, string> = {
  "jbjy-vk9h": "SECOP II - Contratos Electrónicos",
  "dmgg-8hin": "SECOP II - Archivos Descarga Desde 2025"
};

export function SecopPanel() {
  const [dataset, setDataset] = useState<SecopDataset>("jbjy-vk9h");
  const [model, setModel] = useState<SecopSummaryModel | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;
    setLoading(true);
    setError(null);
    getSecopSummary(dataset)
      .then((data) => {
        if (mounted) setModel(data);
      })
      .catch((err: unknown) => {
        if (!mounted) return;
        if (err instanceof ApiError) {
          setError(err.message);
          return;
        }
        setError("No fue posible cargar el resumen SECOP.");
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });
    return () => {
      mounted = false;
    };
  }, [dataset]);

  const nullRows = useMemo(
    () => model?.nullCounts.map((item) => [item.column, item.count.toLocaleString("es-CO")]) ?? [],
    [model]
  );
  const statsRows = useMemo(
    () =>
      model?.numericStats.map((item) => [
        item.column,
        item.min ?? "N/D",
        item.max ?? "N/D",
        item.mean ?? "N/D",
        item.median ?? "N/D"
      ]) ?? [],
    [model]
  );

  return (
    <div className="space-y-4">
      <Card title="Consultas SECOP">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
          <label className="text-sm">
            Dataset:
            <select
              className="ml-2 rounded-md border border-gov-border bg-white px-2 py-1"
              value={dataset}
              onChange={(event) => setDataset(event.target.value as SecopDataset)}
            >
              <option value="jbjy-vk9h">jbjy-vk9h</option>
              <option value="dmgg-8hin">dmgg-8hin</option>
            </select>
          </label>
          <div className="flex gap-2">
            <a
              className="rounded-md border border-gov-border px-3 py-2 text-sm hover:bg-gov-muted"
              href={getSecopExportUrl(dataset, "json")}
            >
              Exportar JSON
            </a>
            <a
              className="rounded-md border border-gov-border px-3 py-2 text-sm hover:bg-gov-muted"
              href={getSecopExportUrl(dataset, "csv")}
            >
              Exportar CSV
            </a>
          </div>
        </div>
      </Card>

      {loading ? <p className="text-sm text-gov-secondary">Cargando métricas...</p> : null}
      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      {model ? (
        <>
          <div className="grid gap-4 md:grid-cols-3">
            <Card title="Dataset activo">
              <p className="text-sm font-medium">{DATASET_LABEL[model.dataset]}</p>
            </Card>
            <Card title="Total registros">
              <p className="text-2xl font-semibold">{model.totalRecords.toLocaleString("es-CO")}</p>
            </Card>
            <Card title="Total columnas">
              <p className="text-2xl font-semibold">{model.totalColumns}</p>
            </Card>
          </div>

          <Card title="Nulos por campo clave">
            <Table headers={["Columna", "Cantidad de nulos"]} rows={nullRows} />
          </Card>

          <Card title="Estadísticas numéricas">
            <Table headers={["Columna", "Mín", "Máx", "Media", "Mediana"]} rows={statsRows} />
          </Card>

          <Card title="Tipos detectados">
            <p className="text-sm">
              <strong>Int-like:</strong> {model.intColumns.join(", ") || "N/D"}
            </p>
            <p className="mt-2 text-sm">
              <strong>String-like:</strong> {model.strColumns.join(", ") || "N/D"}
            </p>
          </Card>

          <Card title="Rango de fecha">
            <p className="text-sm">
              Min: {model.dateRange.min ?? "N/D"} | Max: {model.dateRange.max ?? "N/D"}
            </p>
          </Card>

          {model.lookupSample ? (
            <Card title="Consulta puntual por ID">
              <p className="text-sm">
                {model.lookupSample.idColumn} = {model.lookupSample.idValue}
              </p>
              <pre className="mt-2 overflow-x-auto rounded-md bg-gov-muted p-2 text-xs">
                {JSON.stringify(model.lookupSample.row, null, 2)}
              </pre>
            </Card>
          ) : null}
        </>
      ) : null}
    </div>
  );
}
