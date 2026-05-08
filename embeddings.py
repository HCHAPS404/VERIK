"""Generacion de embeddings usando Cohere con procesamiento por lotes."""

from __future__ import annotations

import logging

from config import MODELO_EMBED, co

logger = logging.getLogger(__name__)

MAX_BATCH = 96


def embed_texts(list_of_texts: list[str], input_type: str = "search_document") -> list[list[float]]:
    """Genera embeddings para una lista de textos.

    Args:
        list_of_texts: Lista de textos a vectorizar.
        input_type: search_document para indexado, search_query para consulta.
    """
    if not list_of_texts:
        return []

    if co is None:
        raise RuntimeError("Cliente Cohere no inicializado. Revisa COHERE_API_KEY.")

    all_embeddings: list[list[float]] = []
    for start in range(0, len(list_of_texts), MAX_BATCH):
        batch = list_of_texts[start : start + MAX_BATCH]
        try:
            resp = co.embed(
                texts=batch,
                model=MODELO_EMBED,
                input_type=input_type,
            )
            all_embeddings.extend(resp.embeddings)
            logger.info(
                "Embedding batch procesado: %s-%s de %s",
                start,
                min(start + MAX_BATCH, len(list_of_texts)),
                len(list_of_texts),
            )
        except Exception as exc:
            logger.exception("Error generando embeddings con Cohere: %s", exc)
            raise

    return all_embeddings
