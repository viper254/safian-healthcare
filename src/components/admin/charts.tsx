"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatKES } from "@/lib/utils";

const PIE_COLORS = ["#F68B1F", "#22B04A", "#3B82F6", "#A855F7"];

export function RevenueAreaChart({
  data,
}: {
  data: { label: string; revenue: number; orders: number }[];
}) {
  return (
    <div className="h-64 sm:h-72 -mx-2 sm:mx-0">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <defs>
            <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#F68B1F" stopOpacity={0.5} />
              <stop offset="100%" stopColor="#F68B1F" stopOpacity={0} />
            </linearGradient>
            <linearGradient id="ordGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#22B04A" stopOpacity={0.4} />
              <stop offset="100%" stopColor="#22B04A" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={60}
            tickFormatter={(v) => `${(v / 1000).toFixed(0)}K`} />
          <Tooltip
            formatter={(value, name) => {
              const n = Number(value);
              return [
                name === "revenue" ? formatKES(n) : `${n} orders`,
                name === "revenue" ? "Revenue" : "Orders",
              ];
            }}
            contentStyle={{
              borderRadius: 12,
              border: "1px solid #e5e7eb",
              fontSize: 11,
            }}
          />
          <Area
            type="monotone"
            dataKey="revenue"
            stroke="#F68B1F"
            strokeWidth={2.5}
            fill="url(#revGrad)"
          />
          <Area
            type="monotone"
            dataKey="orders"
            stroke="#22B04A"
            strokeWidth={2}
            fill="url(#ordGrad)"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}

export function CategoryPieChart({
  data,
}: {
  data: { name: string; value: number }[];
}) {
  return (
    <div className="h-64 sm:h-72">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            innerRadius={50}
            outerRadius={80}
            paddingAngle={3}
            dataKey="value"
            nameKey="name"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v) => [`${Number(v)}%`, "Share"]}
            contentStyle={{ borderRadius: 12, fontSize: 11 }}
          />
          <Legend wrapperStyle={{ fontSize: 11 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}

export function VisitsBarChart({
  data,
}: {
  data: { label: string; visits: number }[];
}) {
  return (
    <div className="h-64 sm:h-72 -mx-2 sm:mx-0">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
          <CartesianGrid vertical={false} stroke="#e5e7eb" strokeDasharray="3 3" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} tickLine={false} axisLine={false} />
          <YAxis tick={{ fontSize: 10 }} tickLine={false} axisLine={false} width={35} />
          <Tooltip
            formatter={(v) => [`${Number(v)} visits`, "Traffic"]}
            contentStyle={{ borderRadius: 12, fontSize: 11 }}
          />
          <Bar dataKey="visits" fill="#F68B1F" radius={[6, 6, 0, 0]} maxBarSize={22} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
