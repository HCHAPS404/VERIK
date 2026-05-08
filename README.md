# VERIK — Verificación Documental con RAG

Plataforma gubernamental de verificación documental mediante **Retrieval-Augmented Generation (RAG)** para el Hackathon Colombia 5.0.

## ¿Qué hace VERIK?

VERIK es un sistema que permite **indexar documentos base** (PDFs) en una base de datos vectorial y luego **verificar otros documentos** contra esa base, determinando si cada fragmento de texto está SOPORTADO, CONTRADECIDO o NO MENCIONADO por los documentos fuente. Además ofrece un módulo de analítica de datos públicos de **SECOP** (Sistema Electrónico de Contratación Pública de Colombia).

## Arquitectura

```
frontend (Next.js 16 / React 19)  ──►  backend (FastAPI / Python 3.14)
                                          │
                                          ├── Cohere (embeddings multilingual-v3.0)
                                          ├── ChromaDB (vector store persistente)
                                          ├── DeepSeek (LLM para verificación JSON)
                                          └── datos.gov.co (SOQL API para SECOP)
```

## Stack tecnológico

### Backend
| Componente | Tecnología |
|---|---|
| Framework API | FastAPI 0.136 + Uvicorn |
| Vector DB | ChromaDB (persistente en `chroma_db/`) |
| Embeddings | Cohere (`embed-multilingual-v3.0`) |
| LLM | DeepSeek Chat (vía OpenAI-compatible SDK) |
| Extracción PDF | PyMuPDF (fitz) |
| Chunking | LangChain RecursiveCharacterTextSplitter |
| Validación | Pydantic v2 |

### Frontend
| Componente | Tecnología |
|---|---|
| Framework | Next.js 16 (App Router) |
| UI | React 19 + Tailwind CSS 4 |
| Estado | Zustand 5 |
| Gráficos | Recharts |
| Validación | Zod |
| Tests | Vitest + Testing Library |

## Endpoints de la API

### `GET /health`
Health check del servicio.

### `POST /ingest`
Ingesta e indexación de PDFs base en ChromaDB. Acepta múltiples archivos PDF. Cada PDF se extrae página por página, se divide en chunks de ~500 caracteres (con 50 de solapamiento) y se generan embeddings con Cohere.

### `POST /verify`
Verifica un PDF contra los documentos indexados. Por cada chunk del PDF se recuperan los `top_k` documentos más similares de ChromaDB y se consulta a DeepSeek que emita un veredicto estructurado en JSON:
- **SOPORTADA**: el contenido del chunk está respaldado por las fuentes.
- **CONTRADICHA**: el contenido contradice las fuentes.
- **NO MENCIONADA**: el contenido no aparece en las fuentes.

Parámetros: `file` (PDF), `top_k` (1-20, default 5).

### `POST /verify/stream`
Versión streaming (SSE) del endpoint de verificación. Emite eventos en tiempo real:
- `start` → inicia con total de chunks
- `step` → progreso (embedding, retrieval)
- `verdict` → resultado por chunk
- `progress` → avance (done/total)
- `final` → resumen final

### `GET /secop/summary?dataset={id}`
Resumen analítico de un dataset SECOP desde datos.gov.co. Los datasets disponibles son:
- `jbjy-vk9h` — SECOP II: Contratos Electrónicos (5.6M registros, 84 columnas)
- `dmgg-8hin` — SECOP II: Archivos Descarga Desde 2025

Retorna: total de registros, total de columnas, conteo de nulos por campo clave, columnas numéricas/categóricas, rango de fechas, estadísticas (min, max, media, mediana) y muestra de lookup.

### `GET /secop/export?dataset={id}&format={json|csv}`
Exporta el resumen SECOP en formato JSON o CSV descargable.

## Configuración

Renombrar `.env.example` a `.env` y configurar las API keys:

```env
COHERE_API_KEY=tu_cohere_api_key
DEEPSEEK_API_KEY=tu_deepseek_api_key
```

### Variables de entorno del frontend (opcional)

| Variable | Default | Descripción |
|---|---|---|
| `NEXT_PUBLIC_API_BASE_URL` | `http://127.0.0.1:8001` | URL del backend |
| `NEXT_PUBLIC_FEATURE_INGEST` | `true` | Habilitar módulo de ingesta |
| `NEXT_PUBLIC_FEATURE_VERIFY` | `true` | Habilitar módulo de verificación |
| `NEXT_PUBLIC_FEATURE_VERIFY_STREAM` | `true` | Habilitar modo streaming SSE |
| `NEXT_PUBLIC_FEATURE_CHARTS` | `true` | Habilitar gráficos |

## Instalación y ejecución

### Backend

```bash
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # editar con tus API keys
uvicorn main:app --host 0.0.0.0 --port 8001
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # opcional
npm run dev             # http://localhost:3000
```

## Flujo de uso típico

1. **Indexar documentos base**: Cargar PDFs de referencia (contratos, normativas, etc.) desde la sección **Ingesta** o vía `POST /ingest`.
2. **Verificar un documento**: Cargar un PDF a auditar desde **Verificar** o vía `POST /verify`. El sistema recupera los fragmentos más similares de la base vectorial y DeepSeek clasifica cada chunk.
3. **Consultar SECOP**: Desde **SECOP Analytics** se pueden consultar métricas agregadas de los datasets públicos de contratación y exportarlas.

## Seguridad

- Las API keys de Cohere y DeepSeek se manejan exclusivamente por variables de entorno en el backend.
- El frontend implementa headers de seguridad (CSP, X-Frame-Options, X-Content-Type-Options, Referrer-Policy).
- Cumplimiento de accesibilidad WCAG 2.1 AA (skip links, roles ARIA, contraste adecuado).
- El frontend utiliza rewrites de Next.js para no exponer la URL del backend al cliente.

## Estructura del proyecto

```
VERIK/
├── main.py               # Punto de entrada FastAPI
├── config.py             # Configuración centralizada y clientes API
├── database.py           # Acceso a ChromaDB
├── embeddings.py         # Generación de embeddings con Cohere
├── llm.py                # Verificación con DeepSeek
├── preprocessing.py      # Extracción PDF y división en chunks
├── schemas.py            # Modelos Pydantic
├── requirements.txt      # Dependencias Python
├── routers/
│   ├── ingest.py         # POST /ingest
│   ├── verify.py         # POST /verify, /verify/stream
│   └── secop.py          # GET /secop/summary, /secop/export
├── frontend/
│   ├── src/
│   │   ├── app/          # Páginas Next.js (/, /ingest, /verify, /secop)
│   │   ├── core/         # Cliente HTTP, SSE, config, feature flags, i18n, store
│   │   ├── modules/      # Módulos: dashboard, ingest, verify, secop
│   │   └── shared/       # Componentes UI compartidos y layouts
│   └── package.json
└── chroma_db/            # Datos persistentes de ChromaDB (generado en runtime)
```
