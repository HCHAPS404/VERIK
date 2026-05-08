import { featureFlags } from "@/core/config/feature-flags";
import { VerifyPanel } from "@/modules/verify";

export default function VerifyPage() {
  if (!featureFlags.verify) return <p className="text-sm">Módulo de verificación deshabilitado por feature flag.</p>;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Verificar documento</h2>
      <VerifyPanel />
    </div>
  );
}
