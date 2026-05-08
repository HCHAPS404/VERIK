"""Modelos Pydantic para respuestas de la API."""

from __future__ import annotations

from typing import Any

from pydantic import BaseModel, Field


class IndexedFile(BaseModel):
    """Resumen de indexacion por archivo."""

    filename: str
    pages: int
    chunks: int


class IngestResponse(BaseModel):
    """Respuesta del endpoint de ingesta."""

    indexed_files: list[IndexedFile]
    total_chunks: int
    collection: str = "documentos_fuente"


class VerifySummary(BaseModel):
    """Resumen agregado de verificacion."""

    total_chunks: int
    supported: int
    contradicted: int
    not_mentioned: int
    support_score: float = Field(ge=0.0, le=1.0)


class VerifyResult(BaseModel):
    """Resultado por chunk."""

    chunk_index: int
    chunk_text: str
    verdict: str
    justification: str
    sources: list[str]
    retrieved: list[dict[str, Any]]


class VerifyResponse(BaseModel):
    """Respuesta completa de verificacion."""

    summary: VerifySummary
    results: list[VerifyResult]


class NumericStats(BaseModel):
    """Metricas agregadas de una columna numerica."""

    min: str | None = None
    max: str | None = None
    mean: str | None = None
    median: str | None = None


class SecopSummaryResponse(BaseModel):
    """Resumen agregado para datasets de SECOP."""

    dataset: str
    total_records: int
    total_columns: int
    null_counts: dict[str, int]
    int_columns: list[str]
    str_columns: list[str]
    date_range: dict[str, str | None]
    numeric_stats: dict[str, NumericStats]
    lookup_sample: dict[str, Any] | None = None
