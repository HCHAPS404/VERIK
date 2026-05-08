# Frontend VERIK

Dashboard modular gubernamental en Next.js para consumir la API RAG de verificación documental.

## Requisitos

- Node.js 20+ (recomendado LTS)
- npm 10+

## Arranque local

```bash
cd frontend
npm install
cp .env.example .env.local
npm run dev
```

Frontend: `http://localhost:3000`  
Backend esperado: `http://127.0.0.1:8001`

## Variables de entorno

- `NEXT_PUBLIC_API_BASE_URL`: URL base del backend.
- `NEXT_PUBLIC_FEATURE_INGEST`: habilita/deshabilita módulo ingest.
- `NEXT_PUBLIC_FEATURE_VERIFY`: habilita/deshabilita módulo verify.
- `NEXT_PUBLIC_FEATURE_VERIFY_STREAM`: habilita/deshabilita modo SSE.
- `NEXT_PUBLIC_FEATURE_CHARTS`: habilita/deshabilita gráficos dashboard.

## Arquitectura modular

- `src/modules/<feature>/` contiene:
  - `components/`
  - `services/`
  - `mappers/`
  - `store.ts`
  - `types.ts`
  - `index.ts` (API pública)

Regla: importar módulos siempre desde `index.ts` del módulo para preservar desacoplamiento.

## Cómo crear un módulo nuevo

1. Crea `src/modules/nuevo-modulo/` con la plantilla estándar.
2. Exporta API pública en `src/modules/nuevo-modulo/index.ts`.
3. Añade flag en `src/core/config/feature-flags.ts`.
4. Crea ruta en `src/app/nuevo-modulo/page.tsx`.
5. Añade pruebas mínimas de mappers/servicios en `tests/`.

## Scripts

- `npm run dev`: desarrollo.
- `npm run lint`: linting.
- `npm run test`: pruebas unitarias.
- `npm run build`: build producción.
