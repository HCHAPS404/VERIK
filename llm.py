"""Verificacion de fragmentos mediante DeepSeek Chat en formato JSON."""

from __future__ import annotations

import json
import logging
from typing import Any

from config import MODELO_LLM, deepseek

logger = logging.getLogger(__name__)


def verificar_fragmento(texto_chunk: str, contexto_docs: list[str]) -> dict[str, Any]:
    """Evalua un fragmento contra contexto recuperado y retorna JSON estructurado."""
    if deepseek is None:
        raise RuntimeError("Cliente DeepSeek no inicializado. Revisa DEEPSEEK_API_KEY.")

    contexto_formateado = "\n\n".join(
        f"Fuente {idx + 1}: {doc}" for idx, doc in enumerate(contexto_docs)
    )

    system_prompt = (
        "Eres un verificador de hechos. "
        "Responde unicamente en JSON valido con estas claves exactas: "
        '"veredicto", "justificacion", "fuentes". '
        'El campo "veredicto" solo puede ser: SOPORTADA, CONTRADICHA o NO MENCIONADA.'
    )

    user_prompt = (
        f"Fragmento a verificar:\n{texto_chunk}\n\n"
        f"Contexto recuperado:\n{contexto_formateado}\n\n"
        "Devuelve el JSON solicitado."
    )

    try:
        response = deepseek.chat.completions.create(
            model=MODELO_LLM,
            messages=[
                {"role": "system", "content": system_prompt},
                {"role": "user", "content": user_prompt},
            ],
            response_format={"type": "json_object"},
            temperature=0,
        )
        content = response.choices[0].message.content or "{}"
        return json.loads(content)
    except json.JSONDecodeError:
        logger.exception("La respuesta del LLM no fue JSON valido.")
        return {
            "veredicto": "NO MENCIONADA",
            "justificacion": "No se pudo parsear JSON valido desde el modelo.",
            "fuentes": [],
        }
    except Exception as exc:
        logger.exception("Error consultando DeepSeek: %s", exc)
        return {
            "veredicto": "NO MENCIONADA",
            "justificacion": f"Error al verificar: {exc}",
            "fuentes": [],
        }
