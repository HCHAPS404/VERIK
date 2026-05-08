import { featureFlags } from "@/core/config/feature-flags";
import { IngestPanel } from "@/modules/ingest";

export default function IngestPage() {
  if (!featureFlags.ingest) return <p className="text-sm">Módulo de ingesta deshabilitado por feature flag.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Ingesta de documentos</h2>
      <IngestPanel />
    </div>
  );
}
