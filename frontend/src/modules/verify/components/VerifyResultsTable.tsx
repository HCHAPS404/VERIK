import { Badge } from "@/shared/components/ui/Badge";
import { Table } from "@/shared/components/ui/Table";
import type { VerifyResult } from "@/modules/verify/types";

function verdictVariant(verdict: VerifyResult["verdict"]): "success" | "danger" | "warning" {
  if (verdict === "SOPORTADA") return "success";
  if (verdict === "CONTRADICHA") return "danger";
  return "warning";
}

type VerifyResultsTableProps = {
  results: VerifyResult[];
};

export function VerifyResultsTable({ results }: VerifyResultsTableProps) {
  return (
    <Table
      headers={["Chunk", "Veredicto", "Justificación", "Fuentes"]}
      rows={results.map((result) => [
        result.chunkIndex,
        <Badge key={`v-${result.chunkIndex}`} variant={verdictVariant(result.verdict)}>
          {result.verdict}
        </Badge>,
        result.justification,
        result.sources.join(", ")
      ])}
    />
  );
}
