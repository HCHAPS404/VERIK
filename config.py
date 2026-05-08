"""Configuracion centralizada del sistema RAG."""

from __future__ import annotations

import logging
import os

import cohere
from dotenv import load_dotenv
from openai import OpenAI

load_dotenv()

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

CHROMA_PERSIST_DIR = "./chroma_db"
CHUNK_SIZE = 500
CHUNK_OVERLAP = 50
MODELO_EMBED = "embed-multilingual-v3.0"
MODELO_LLM = "deepseek-chat"

COHERE_API_KEY = os.getenv("COHERE_API_KEY", "").strip()
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY", "").strip()

if not COHERE_API_KEY:
    logger.warning("COHERE_API_KEY no esta configurada.")
if not DEEPSEEK_API_KEY:
    logger.warning("DEEPSEEK_API_KEY no esta configurada.")

co = cohere.Client(COHERE_API_KEY) if COHERE_API_KEY else None
deepseek = (
    OpenAI(api_key=DEEPSEEK_API_KEY, base_url="https://api.deepseek.com")
    if DEEPSEEK_API_KEY
    else None
)
