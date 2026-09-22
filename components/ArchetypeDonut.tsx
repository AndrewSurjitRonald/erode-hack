"use client";

import { PieChart, Pie, Cell } from "recharts";

const ARCHETYPE_COLORS: Record<string, string> = {
  "On Track": "#028090",
  "Needs Support": "#E76F51",
  "Uneven — targeted help needed": "#6C63FF",
};

const ARCHETYPE_SHORT: Record<string, string> = {
  "On Track": "On Track",
  "Needs Support": "Needs Support",
  "Uneven — targeted help needed": "Uneven — Targeted Help",
};

export function ArchetypeDonut({ students }: { students: { archetype: string }[] }) {
  const counts: Record<string, number> = {};
  for (const s of students) counts[s.archetype] = (counts[s.archetype] ?? 0) + 1;

  const order = ["On Track", "Needs Support", "Uneven — targeted help needed"];
  const data = order
    .filter((label) => counts[label] > 0)
    .map((label) => ({ name: label, value: counts[label] }));

  const total = students.length;

  return (
    <div className="flex flex-col gap-4">
      <div className="relative h-52 flex items-center justify-center">
        <PieChart width={208} height={208}>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            cx={104}
            cy={104}
            innerRadius={68}
            outerRadius={96}
            paddingAngle={data.length > 1 ? 3 : 0}
            startAngle={0}
            endAngle={360}
            stroke="none"
          >
            {data.map((d) => (
              <Cell key={d.name} fill={ARCHETYPE_COLORS[d.name] ?? "#999"} />
            ))}
          </Pie>
        </PieChart>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold text-dark">{total}</span>
          <span className="text-xs font-semibold text-muted">Students</span>
        </div>
      </div>

      <ul className="flex flex-col gap-2">
        {order
          .filter((label) => counts[label] > 0)
          .map((label) => {
            const pct = total > 0 ? Math.round((counts[label] / total) * 100) : 0;
            return (
              <li key={label} className="flex items-center gap-2.5 text-sm">
                <span
                  className="w-2.5 h-2.5 rounded-full shrink-0"
                  style={{ backgroundColor: ARCHETYPE_COLORS[label] }}
                />
                <span className="text-ink font-medium flex-1">{ARCHETYPE_SHORT[label]}</span>
                <span className="font-bold text-dark">{pct}%</span>
              </li>
            );
          })}
      </ul>
    </div>
  );
}
