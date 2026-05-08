import { DashboardKpis } from "@/modules/dashboard";
import { Card } from "@/shared/components/ui/Card";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold">Dashboard institucional</h2>
      <DashboardKpis />
      <Card title="Estado del sistema">
        <p className="text-sm">
          Usa el menú lateral para indexar documentos base y verificar nuevos PDFs contra la base vectorial.
        </p>
      </Card>
      <Card title="SECOP Analytics">
        <p className="text-sm">
          Consulta métricas consolidadas de los datasets SECOP y exporta resultados en JSON o CSV.
        </p>
        <Link className="mt-3 inline-block text-sm text-gov-primary underline" href="/secop">
          Ir al módulo SECOP
        </Link>
      </Card>
    </div>
  );
}
