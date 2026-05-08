"""Punto de entrada de la API de verificacion documental RAG."""

from __future__ import annotations

import logging

from fastapi import FastAPI

import database
from routers.ingest import router as ingest_router
from routers.secop import router as secop_router
from routers.verify import router as verify_router

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = FastAPI(
    title="RAG Doc Verifier API",
    description="API para ingesta y verificacion documental usando RAG.",
    version="0.1.0",
)


@app.on_event("startup")
def on_startup() -> None:
    """Inicializa la coleccion de ChromaDB al arrancar la API."""
    database.get_or_create_collection()
    logger.info("Coleccion ChromaDB lista.")


@app.get("/health")
def health() -> dict[str, str]:
    """Endpoint basico de salud del servicio."""
    return {"status": "ok"}


app.include_router(ingest_router)
app.include_router(verify_router)
app.include_router(secop_router)
