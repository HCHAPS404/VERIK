"use client";

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";

import type { VerifySummary } from "@/modules/verify/types";

type VerdictDonutProps = {
  summary: VerifySummary;
};

const COLORS = ["#1b7f3a", "#b00020", "#b35c00"];

export function VerdictDonut({ summary }: VerdictDonutProps) {
  const data = [
    { name: "Soportada", value: summary.supported },
    { name: "Contradicha", value: summary.contradicted },
    { name: "No mencionada", value: summary.notMentioned }
  ];

  return (
    <div className="h-72 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={data} dataKey="value" nameKey="name" innerRadius={60} outerRadius={90}>
            {data.map((entry, index) => (
              <Cell key={entry.name} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
