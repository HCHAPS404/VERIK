import { DashboardKpis } from "@/modules/dashboard";
import { Card } from "@/shared/components/ui/Card";

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
    </div>
  );
}
