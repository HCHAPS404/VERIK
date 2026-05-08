"""Endpoints de verificacion de documento: sincronico y streaming SSE."""

from __future__ import annotations

import json
import logging
from typing import Any

from fastapi import APIRouter, File, HTTPException, Query, UploadFile
from fastapi.responses import StreamingResponse

import database
from embeddings import embed_texts
from llm import verificar_fragmento
from preprocessing import extract_text_from_pdf, split_text_into_chunks
from schemas import VerifyResponse, VerifyResult, VerifySummary

logger = logging.getLogger(__name__)

router = APIRouter(tags=["verify"])


def _build_verify_summary(results: list[VerifyResult]) -> VerifySummary:
    total = len(results)
    supported = sum(1 for item in results if item.verdict == "SOPORTADA")
    contradicted = sum(1 for item in results if item.verdict == "CONTRADICHA")
    not_mentioned = sum(1 for item in results if item.verdict == "NO MENCIONADA")
    score = (supported / total) if total else 0.0
    return VerifySummary(
        total_chunks=total,
        supported=supported,
        contradicted=contradicted,
        not_mentioned=not_mentioned,
        support_score=score,
    )


def _format_retrieved(query_result: dict[str, Any]) -> tuple[list[str], list[dict[str, Any]]]:
    docs = query_result.get("documents", [[]])[0] or []
    metadatas = query_result.get("metadatas", [[]])[0] or []
    distances = query_result.get("distances", [[]])[0] or []
    contexto_docs = [str(doc) for doc in docs]

    retrieved: list[dict[str, Any]] = []
    for idx, doc in enumerate(docs):
        md = metadatas[idx] if idx < len(metadatas) else {}
        distance = distances[idx] if idx < len(distances) else None
        retrieved.append(
            {
                "filename": md.get("filename"),
                "page": md.get("page"),
                "chunk_index": md.get("chunk_index"),
                "distance": distance,
                "text": doc,
            }
        )
    return contexto_docs, retrieved


async def _extract_chunks_from_upload(upload: UploadFile) -> list[str]:
    if not upload.filename.lower().endswith(".pdf"):
        raise HTTPException(status_code=400, detail="Solo se permite un archivo PDF.")
    file_bytes = await upload.read()
    pages = extract_text_from_pdf(file_bytes)
    chunks: list[str] = []
    for page in pages:
        chunks.extend(split_text_into_chunks(str(page["text"])))
    if not chunks:
        raise HTTPException(status_code=400, detail="No se pudo extraer texto del PDF enviado.")
    return chunks


@router.post("/verify", response_model=VerifyResponse)
async def verify_document(
    file: UploadFile = File(...),
    top_k: int = Query(default=5, ge=1, le=20),
) -> VerifyResponse:
    """Verifica todos los chunks del PDF y retorna respuesta JSON final."""
    try:
        chunks = await _extract_chunks_from_upload(file)
        chunk_embeddings = embed_texts(chunks, input_type="search_query")

        results: list[VerifyResult] = []
        for index, (chunk, embedding) in enumerate(zip(chunks, chunk_embeddings)):
            query_result = database.query_similar(embedding, n_results=top_k)
            contexto_docs, retrieved = _format_retrieved(query_result)
            llm_result = verificar_fragmento(chunk, contexto_docs)
            results.append(
                VerifyResult(
                    chunk_index=index,
                    chunk_text=chunk,
                    verdict=str(llm_result.get("veredicto", "NO MENCIONADA")),
                    justification=str(llm_result.get("justificacion", "")),
                    sources=list(llm_result.get("fuentes", [])),
                    retrieved=retrieved,
                )
            )

        summary = _build_verify_summary(results)
        return VerifyResponse(summary=summary, results=results)
    except HTTPException:
        raise
    except Exception as exc:
        logger.exception("Error durante verificacion: %s", exc)
        raise HTTPException(status_code=500, detail=f"Error verificando documento: {exc}") from exc


@router.post("/verify/stream")
async def verify_document_stream(
    file: UploadFile = File(...),
    top_k: int = Query(default=5, ge=1, le=20),
) -> StreamingResponse:
    """Verifica por chunks y emite eventos SSE estilo agente."""
    chunks = await _extract_chunks_from_upload(file)

    async def event_generator():
        results: list[VerifyResult] = []
        yield _sse("start", {"total_chunks": len(chunks)})

        try:
            chunk_embeddings = embed_texts(chunks, input_type="search_query")
            for index, (chunk, embedding) in enumerate(zip(chunks, chunk_embeddings)):
                yield _sse(
                    "step",
                    {"chunk_index": index, "stage": "embedding", "info": "Embedding generado"},
                )
                query_result = database.query_similar(embedding, n_results=top_k)
                contexto_docs, retrieved = _format_retrieved(query_result)
                yield _sse(
                    "step",
                    {"chunk_index": index, "stage": "retrieval", "info": f"{len(retrieved)} fuentes"},
                )
                llm_result = verificar_fragmento(chunk, contexto_docs)
                result = VerifyResult(
                    chunk_index=index,
                    chunk_text=chunk,
                    verdict=str(llm_result.get("veredicto", "NO MENCIONADA")),
                    justification=str(llm_result.get("justificacion", "")),
                    sources=list(llm_result.get("fuentes", [])),
                    retrieved=retrieved,
                )
                results.append(result)
                yield _sse(
                    "verdict",
                    {
                        "chunk_index": index,
                        "chunk_text": chunk,
                        "verdict": result.verdict,
                        "justification": result.justification,
                        "sources": result.sources,
                    },
                )
                yield _sse("progress", {"done": index + 1, "total": len(chunks)})
        except Exception as exc:
            logger.exception("Error en stream de verificacion: %s", exc)
            yield _sse("error", {"message": str(exc)})

        summary = _build_verify_summary(results)
        yield _sse("final", summary.model_dump())

    return StreamingResponse(event_generator(), media_type="text/event-stream")


def _sse(event_name: str, data: dict[str, Any]) -> str:
    """Formatea un evento Server-Sent Events."""
    return f"event: {event_name}\ndata: {json.dumps(data, ensure_ascii=False)}\n\n"
