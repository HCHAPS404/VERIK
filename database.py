"""Funciones de acceso y consulta para ChromaDB persistente."""

from __future__ import annotations

import logging
from typing import Any
from uuid import uuid4

import chromadb
from chromadb.api.models.Collection import Collection

from config import CHROMA_PERSIST_DIR

logger = logging.getLogger(__name__)

_client = chromadb.PersistentClient(path=CHROMA_PERSIST_DIR)


def get_or_create_collection() -> Collection:
    """Obtiene o crea la coleccion principal de documentos fuente."""
    logger.info("Inicializando coleccion ChromaDB en %s", CHROMA_PERSIST_DIR)
    return _client.get_or_create_collection(name="documentos_fuente")


def add_documents(
    chunks: list[str],
    embeddings: list[list[float]],
    metadatas: list[dict[str, Any]],
) -> None:
    """Agrega fragmentos, embeddings y metadatos a la coleccion persistente."""
    if not (len(chunks) == len(embeddings) == len(metadatas)):
        raise ValueError("chunks, embeddings y metadatas deben tener la misma longitud.")

    collection = get_or_create_collection()
    ids = [str(uuid4()) for _ in chunks]
    collection.add(documents=chunks, embeddings=embeddings, metadatas=metadatas, ids=ids)
    logger.info("Se agregaron %s chunks a la coleccion.", len(chunks))


def query_similar(embedding: list[float], n_results: int = 5) -> dict[str, Any]:
    """Devuelve documentos similares junto con metadatos y distancias."""
    collection = get_or_create_collection()
    return collection.query(query_embeddings=[embedding], n_results=n_results)


def get_collection_stats() -> dict[str, Any]:
    """Devuelve estadisticas de la coleccion: total chunks y archivos unicos."""
    collection = get_or_create_collection()
    total = collection.count()
    if total == 0:
        return {"total_chunks": 0, "total_files": 0, "files": []}

    result = collection.get(include=["metadatas"])
    filenames: list[str] = []
    for md in (result.get("metadatas") or []):
        name = md.get("filename") if isinstance(md, dict) else None
        if name and name not in filenames:
            filenames.append(name)

    return {
        "total_chunks": total,
        "total_files": len(filenames),
        "files": filenames,
    }
