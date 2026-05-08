"""Endpoint para ingesta e indexacion de documentos base."""

from __future__ import annotations

import logging

from fastapi import APIRouter, File, HTTPException, UploadFile

import database
from embeddings import embed_texts
from preprocessing import extract_document_pages, split_text_into_chunks
from schemas import IndexedFile, IngestResponse

logger = logging.getLogger(__name__)

router = APIRouter(tags=["ingest"])

_ALLOWED_SUFFIXES = (".pdf", ".csv")


def _is_allowed_document(filename: str | None) -> bool:
    if not filename:
        return False
    lower = filename.lower()
    return any(lower.endswith(s) for s in _ALLOWED_SUFFIXES)


@router.post("/ingest", response_model=IngestResponse)
async def ingest_documents(files: list[UploadFile] = File(...)) -> IngestResponse:
    """Ingiere uno o varios PDF o CSV y los indexa en ChromaDB."""
    if not files:
        raise HTTPException(status_code=400, detail="Debes subir al menos un archivo (PDF o CSV).")

    indexed_files: list[IndexedFile] = []
    total_chunks = 0

    for upload in files:
        if not _is_allowed_document(upload.filename):
            raise HTTPException(
                status_code=400,
                detail=f"Archivo no valido: {upload.filename}. Solo se aceptan PDF o CSV.",
            )

        try:
            file_bytes = await upload.read()
            pages = extract_document_pages(upload.filename or "documento", file_bytes)
            file_chunks: list[str] = []
            file_metadatas: list[dict[str, object]] = []

            for page in pages:
                page_number = int(page["page_number"])
                page_text = str(page["text"])
                chunks = split_text_into_chunks(page_text)
                for chunk_index, chunk in enumerate(chunks):
                    file_chunks.append(chunk)
                    file_metadatas.append(
                        {
                            "filename": upload.filename,
                            "page": page_number,
                            "chunk_index": chunk_index,
                        }
                    )

            if file_chunks:
                embeddings = embed_texts(file_chunks, input_type="search_document")
                database.add_documents(file_chunks, embeddings, file_metadatas)

            indexed_files.append(
                IndexedFile(
                    filename=upload.filename,
                    pages=len(pages),
                    chunks=len(file_chunks),
                )
            )
            total_chunks += len(file_chunks)
            logger.info("Archivo indexado: %s (%s chunks)", upload.filename, len(file_chunks))
        except HTTPException:
            raise
        except Exception as exc:
            logger.exception("Error indexando %s: %s", upload.filename, exc)
            raise HTTPException(
                status_code=500,
                detail=f"Error procesando archivo {upload.filename}: {exc}",
            ) from exc

    return IngestResponse(indexed_files=indexed_files, total_chunks=total_chunks)
