"""Extraccion de texto desde PDF o CSV y division en chunks."""

from __future__ import annotations

import csv
import logging
from io import BytesIO, StringIO
from typing import Any

import fitz
from langchain_text_splitters import RecursiveCharacterTextSplitter

from config import CHUNK_OVERLAP, CHUNK_SIZE

logger = logging.getLogger(__name__)


def extract_text_from_pdf(file_bytes: bytes) -> list[dict[str, Any]]:
    """Extrae texto de un PDF pagina por pagina.

    Retorna una lista de diccionarios con:
    - page_number: numero de pagina (1-indexado)
    - text: texto extraido de esa pagina
    """
    pages: list[dict[str, Any]] = []
    try:
        with fitz.open(stream=BytesIO(file_bytes), filetype="pdf") as doc:
            for page_index, page in enumerate(doc, start=1):
                text = page.get_text("text").strip()
                if text:
                    pages.append({"page_number": page_index, "text": text})
    except Exception as exc:
        logger.exception("Fallo al extraer texto del PDF: %s", exc)
        raise

    logger.info("Se extrajeron %s paginas con texto.", len(pages))
    return pages


def extract_text_from_csv(file_bytes: bytes) -> list[dict[str, Any]]:
    """Convierte un CSV en texto plano y lo devuelve como una pseudo-pagina.

    Usa DictReader para conservar nombres de columna en cada fila.
    """
    decoded: str | None = None
    for encoding in ("utf-8-sig", "utf-8", "latin-1"):
        try:
            decoded = file_bytes.decode(encoding)
            break
        except UnicodeDecodeError:
            continue
    if decoded is None:
        raise ValueError("No fue posible decodificar el CSV (encoding no soportado).")

    reader = csv.DictReader(StringIO(decoded))
    lines: list[str] = []
    if reader.fieldnames:
        lines.append(" | ".join(reader.fieldnames))
    for row in reader:
        parts = [
            f"{key}: {value}"
            for key, value in row.items()
            if value is not None and str(value).strip()
        ]
        if parts:
            lines.append(" | ".join(parts))

    full = "\n".join(lines).strip()
    if not full:
        return []

    logger.info("CSV convertido a texto (%s lineas logicas).", len(lines))
    return [{"page_number": 1, "text": full}]


def extract_document_pages(filename: str, file_bytes: bytes) -> list[dict[str, Any]]:
    """Enruta la extraccion segun extension (.pdf o .csv)."""
    lower = filename.lower()
    if lower.endswith(".pdf"):
        return extract_text_from_pdf(file_bytes)
    if lower.endswith(".csv"):
        return extract_text_from_csv(file_bytes)
    raise ValueError(f"Extension no soportada para {filename}. Use PDF o CSV.")


def split_text_into_chunks(text: str) -> list[str]:
    """Divide un texto en chunks con solapamiento."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )
    chunks = splitter.split_text(text)
    logger.info("Texto dividido en %s chunks.", len(chunks))
    return chunks
