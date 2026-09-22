"use client";

import { PieChart, Pie, Cell, ResponsiveContainer } from "recharts";

const ARCHETYPE_COLORS: Record<string, string> = {
  "On Track": "#10B981",
  "Needs Support": "#3B82F6",
  "Uneven — targeted help needed": "#FB923C",
};

const ARCHETYPE_SHORT: Record<string, string> = {
  "On Track": "On Track",
  "Needs Support": "Needs Support",
  "Uneven — targeted help needed": "Uneven — Targeted Help",
};

const ORDER = ["On Track", "Needs Support", "Uneven — targeted help needed"];

export function ArchetypeDonut({ students }: { students: { archetype: string }[] }) {
  const counts: Record<string, number> = {};
  for (const s of students) counts[s.archetype] = (counts[s.archetype] ?? 0) + 1;

  const total = students.length;
  const data = ORDER.map((label) => ({ name: label, value: counts[label] ?? 0 }));
  // Recharts draws nothing for an all-zero dataset, so show a neutral ring when the class is empty
  const chartData = total > 0 ? data.filter((d) => d.value > 0) : [{ name: "empty", value: 1 }];

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-48 h-48 flex items-center justify-center">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={chartData}
              dataKey="value"
              nameKey="name"
              cx="50%"
              cy="50%"
              innerRadius={58}
              outerRadius={82}
              paddingAngle={chartData.length > 1 ? 2 : 0}
              startAngle={90}
              endAngle={-270}
              stroke="none"
              isAnimationActive={false}
            >
              {chartData.map((d) => (
                <Cell key={d.name} fill={ARCHETYPE_COLORS[d.name] ?? "#E2E8F0"} />
              ))}
            </Pie>
          </PieChart>
        </ResponsiveContainer>
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          <span className="text-3xl font-extrabold text-slate-900 leading-none">{total}</span>
          <span className="text-xs font-semibold text-slate-500 mt-1">Students</span>
        </div>
      </div>

      <ul className="flex flex-col gap-2 w-full pt-1">
        {data.map(({ name, value }) => {
          const pct = total > 0 ? Math.round((value / total) * 100) : 0;
          return (
            <li key={name} className="flex items-center gap-2.5 text-xs sm:text-sm text-slate-700">
              <span
                className="w-2.5 h-2.5 rounded-full shrink-0"
                style={{ backgroundColor: ARCHETYPE_COLORS[name] }}
              />
              <span className="font-medium flex-1 text-slate-600">{ARCHETYPE_SHORT[name]}</span>
              <span className="font-semibold text-slate-800">
                {value} ({pct}%)
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
