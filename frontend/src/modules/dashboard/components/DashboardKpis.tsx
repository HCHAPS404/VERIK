"use client";

import { useEffect, useState } from "react";

import { Card } from "@/shared/components/ui/Card";
import { useIngestStore } from "@/modules/ingest/store";
import { useVerifyStore } from "@/modules/verify/store";
import { getStats, type StatsModel } from "@/modules/dashboard/services/stats.service";

export function DashboardKpis() {
  const ingest = useIngestStore((state) => state.result);
  const verify = useVerifyStore((state) => state.model);
  const [stats, setStats] = useState<StatsModel | null>(null);

  useEffect(() => {
    getStats()
      .then(setStats)
      .catch(() => {});
  }, []);

  const totalChunks = ingest?.totalChunks ?? stats?.totalChunks ?? 0;
  const totalFiles = stats?.totalFiles ?? 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card title="Último score global">
        <p className="text-2xl font-semibold">{verify ? `${(verify.summary.supportScore * 100).toFixed(1)}%` : "N/D"}</p>
      </Card>
      <Card title="Docs indexados">
        <p className="text-2xl font-semibold">{totalFiles}</p>
        <p className="text-xs text-slate-500">{totalChunks} chunks totales</p>
      </Card>
      <Card title="Último total verificado">
        <p className="text-2xl font-semibold">{verify?.summary.totalChunks ?? 0}</p>
      </Card>
    </div>
  );
}
