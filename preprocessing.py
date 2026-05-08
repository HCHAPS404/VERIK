"""Extraccion de texto desde PDF y division en chunks."""

from __future__ import annotations

import logging
from io import BytesIO
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


def split_text_into_chunks(text: str) -> list[str]:
    """Divide un texto en chunks con solapamiento."""
    splitter = RecursiveCharacterTextSplitter(
        chunk_size=CHUNK_SIZE,
        chunk_overlap=CHUNK_OVERLAP,
    )
    chunks = splitter.split_text(text)
    logger.info("Texto dividido en %s chunks.", len(chunks))
    return chunks
