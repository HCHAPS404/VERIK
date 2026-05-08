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
