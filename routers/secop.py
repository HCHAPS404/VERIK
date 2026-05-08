"""Endpoints de consulta agregada para datasets SECOP."""

from __future__ import annotations

import csv
import io
import json
import math
import urllib.parse
import urllib.request
from dataclasses import dataclass
from typing import Any, Literal

from fastapi import APIRouter, HTTPException, Query
from fastapi.responses import JSONResponse, PlainTextResponse

from schemas import NumericStats, SecopSummaryResponse

DatasetId = Literal["jbjy-vk9h", "dmgg-8hin"]
ExportFormat = Literal["json", "csv"]

SOCRATA_BASE = "https://www.datos.gov.co"


@dataclass(frozen=True)
class DatasetConfig:
    dataset_id: DatasetId
    date_column: str
    null_columns: list[str]
    numeric_columns: list[str]
    int_columns: list[str]
    str_columns: list[str]
    lookup_by_id: dict[str, Any] | None = None


DATASET_CONFIG: dict[DatasetId, DatasetConfig] = {
    "jbjy-vk9h": DatasetConfig(
        dataset_id="jbjy-vk9h",
        date_column="fecha_de_firma",
        null_columns=["fecha_de_firma", "fecha_inicio_liquidacion"],
        numeric_columns=["dias_adicionados", "valor_del_contrato"],
        int_columns=[
            "nit_entidad",
            "valor_del_contrato",
            "valor_de_pago_adelantado",
            "valor_facturado",
            "valor_pendiente_de_pago",
            "valor_pagado",
            "valor_amortizado",
            "valor_pendiente_de",
            "valor_pendiente_de_ejecucion",
            "saldo_cdp",
            "saldo_vigencia",
            "dias_adicionados",
            "presupuesto_general_de_la_nacion_pgn",
            "sistema_general_de_participaciones",
            "sistema_general_de_regal_as",
            "recursos_propios_alcald_as_gobernaciones_y_resguardos_ind_genas_",
            "recursos_de_credito",
            "recursos_propios",
            "codigo_entidad",
        ],
        str_columns=[],
    ),
    "dmgg-8hin": DatasetConfig(
        dataset_id="dmgg-8hin",
        date_column="fecha_carga",
        null_columns=["descripci_n", "proceso"],
        numeric_columns=["id_documento", "tamanno_archivo", "nit_entidad"],
        int_columns=["id_documento", "tamanno_archivo", "nit_entidad"],
        str_columns=[
            "n_mero_de_contrato",
            "proceso",
            "nombre_archivo",
            "extensi_n",
            "descripci_n",
            "entidad",
            "url_descarga_documento",
        ],
        lookup_by_id={"id_column": "id_documento", "id_value": 756926574, "columns": ["nombre_archivo", "fecha_carga"]},
    ),
}

router = APIRouter(prefix="/secop", tags=["secop"])


def _run_soql(dataset_id: DatasetId, query: str) -> list[dict[str, Any]]:
    encoded = urllib.parse.urlencode({"$query": query})
    endpoint = f"{SOCRATA_BASE}/resource/{dataset_id}.json?{encoded}"
    try:
        with urllib.request.urlopen(endpoint, timeout=45) as response:
            payload = response.read().decode("utf-8")
    except Exception as exc:  # pragma: no cover - red externa
        raise HTTPException(status_code=502, detail=f"No fue posible consultar SECOP: {exc}") from exc
    try:
        return json.loads(payload)
    except json.JSONDecodeError as exc:
        raise HTTPException(status_code=502, detail="Respuesta invalida de SECOP.") from exc


def _get_total_columns(dataset_id: DatasetId) -> int:
    endpoint = f"{SOCRATA_BASE}/api/views/{dataset_id}"
    try:
        with urllib.request.urlopen(endpoint, timeout=45) as response:
            payload = response.read().decode("utf-8")
    except Exception as exc:  # pragma: no cover - red externa
        raise HTTPException(status_code=502, detail=f"No fue posible leer metadata de SECOP: {exc}") from exc
    data = json.loads(payload)
    return len(data.get("columns", []))


def _median(dataset_id: DatasetId, column: str) -> str | None:
    count_row = _run_soql(dataset_id, f"SELECT count(*) as c WHERE `{column}` is not null")
    if not count_row:
        return None
    total = int(count_row[0]["c"])
    if total == 0:
        return None
    if total % 2 == 1:
        offset = total // 2
        row = _run_soql(
            dataset_id,
            f"SELECT `{column}` as v WHERE `{column}` is not null ORDER BY `{column}` LIMIT 1 OFFSET {offset}",
        )
        return str(row[0]["v"])

    offset_a = total // 2 - 1
    offset_b = total // 2
    row_a = _run_soql(
        dataset_id,
        f"SELECT `{column}` as v WHERE `{column}` is not null ORDER BY `{column}` LIMIT 1 OFFSET {offset_a}",
    )
    row_b = _run_soql(
        dataset_id,
        f"SELECT `{column}` as v WHERE `{column}` is not null ORDER BY `{column}` LIMIT 1 OFFSET {offset_b}",
    )
    median = (float(row_a[0]["v"]) + float(row_b[0]["v"])) / 2
    return str(math.trunc(median) if median.is_integer() else median)


def _build_summary(dataset_id: DatasetId) -> SecopSummaryResponse:
    config = DATASET_CONFIG[dataset_id]
    total_records = int(_run_soql(dataset_id, "SELECT count(*) as c")[0]["c"])
    total_columns = _get_total_columns(dataset_id)

    null_counts: dict[str, int] = {}
    for col in config.null_columns:
        row = _run_soql(dataset_id, f"SELECT count(*) as c WHERE `{col}` is null")
        null_counts[col] = int(row[0]["c"])

    date_row = _run_soql(
        dataset_id,
        f"SELECT min(`{config.date_column}`) as minv, max(`{config.date_column}`) as maxv WHERE `{config.date_column}` is not null",
    )[0]
    date_range = {"min": date_row.get("minv"), "max": date_row.get("maxv")}

    numeric_stats: dict[str, NumericStats] = {}
    for col in config.numeric_columns:
        row = _run_soql(
            dataset_id,
            f"SELECT min(`{col}`) as minv, max(`{col}`) as maxv, avg(`{col}`) as meanv WHERE `{col}` is not null",
        )[0]
        numeric_stats[col] = NumericStats(
            min=row.get("minv"),
            max=row.get("maxv"),
            mean=row.get("meanv"),
            median=_median(dataset_id, col),
        )

    lookup_sample: dict[str, Any] | None = None
    if config.lookup_by_id:
        id_column = str(config.lookup_by_id["id_column"])
        id_value = int(config.lookup_by_id["id_value"])
        cols = [str(value) for value in config.lookup_by_id["columns"]]
        select_cols = ", ".join([f"`{col}` as `{col}`" for col in cols])
        rows = _run_soql(dataset_id, f"SELECT {select_cols} WHERE `{id_column}` = {id_value} LIMIT 1")
        lookup_sample = {"id_column": id_column, "id_value": id_value, "row": rows[0] if rows else None}

    return SecopSummaryResponse(
        dataset=dataset_id,
        total_records=total_records,
        total_columns=total_columns,
        null_counts=null_counts,
        int_columns=config.int_columns,
        str_columns=config.str_columns,
        date_range=date_range,
        numeric_stats=numeric_stats,
        lookup_sample=lookup_sample,
    )


@router.get("/summary", response_model=SecopSummaryResponse)
def secop_summary(dataset: DatasetId = Query(..., description="Dataset SECOP: jbjy-vk9h o dmgg-8hin")) -> SecopSummaryResponse:
    """Devuelve resumen de metricas predefinidas para el dataset seleccionado."""
    return _build_summary(dataset)


@router.get("/export")
def secop_export(
    dataset: DatasetId = Query(..., description="Dataset SECOP: jbjy-vk9h o dmgg-8hin"),
    format: ExportFormat = Query("json", description="Formato de exportacion: json o csv"),
) -> JSONResponse | PlainTextResponse:
    """Exporta el resumen SECOP en formato JSON o CSV."""
    summary = _build_summary(dataset)
    if format == "json":
        return JSONResponse(content=summary.model_dump())

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["section", "field", "value"])
    writer.writerow(["general", "dataset", summary.dataset])
    writer.writerow(["general", "total_records", summary.total_records])
    writer.writerow(["general", "total_columns", summary.total_columns])
    for key, value in summary.null_counts.items():
        writer.writerow(["null_counts", key, value])
    for col in summary.int_columns:
        writer.writerow(["int_columns", col, "int_like"])
    for col in summary.str_columns:
        writer.writerow(["str_columns", col, "str_like"])
    writer.writerow(["date_range", "min", summary.date_range.get("min")])
    writer.writerow(["date_range", "max", summary.date_range.get("max")])
    for col, stats in summary.numeric_stats.items():
        writer.writerow(["numeric_stats", f"{col}.min", stats.min])
        writer.writerow(["numeric_stats", f"{col}.max", stats.max])
        writer.writerow(["numeric_stats", f"{col}.mean", stats.mean])
        writer.writerow(["numeric_stats", f"{col}.median", stats.median])
    if summary.lookup_sample:
        writer.writerow(["lookup", "id_column", summary.lookup_sample.get("id_column")])
        writer.writerow(["lookup", "id_value", summary.lookup_sample.get("id_value")])
        writer.writerow(["lookup", "row", json.dumps(summary.lookup_sample.get("row"), ensure_ascii=False)])

    headers = {"Content-Disposition": f'attachment; filename="secop-{dataset}.csv"'}
    return PlainTextResponse(output.getvalue(), media_type="text/csv", headers=headers)
