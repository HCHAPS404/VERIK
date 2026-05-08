"use client";

import { Card } from "@/shared/components/ui/Card";
import { useIngestStore } from "@/modules/ingest/store";
import { useVerifyStore } from "@/modules/verify/store";

export function DashboardKpis() {
  const ingest = useIngestStore((state) => state.result);
  const verify = useVerifyStore((state) => state.model);

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card title="Último score global">
        <p className="text-2xl font-semibold">{verify ? `${(verify.summary.supportScore * 100).toFixed(1)}%` : "N/D"}</p>
      </Card>
      <Card title="Total chunks indexados">
        <p className="text-2xl font-semibold">{ingest?.totalChunks ?? 0}</p>
      </Card>
      <Card title="Último total verificado">
        <p className="text-2xl font-semibold">{verify?.summary.totalChunks ?? 0}</p>
      </Card>
    </div>
  );
}
