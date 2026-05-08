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
