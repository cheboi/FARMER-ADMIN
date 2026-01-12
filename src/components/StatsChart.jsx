import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

export default function StatsChart({ certified, pending, declined }) {
  const data = [
    { name: "Certified", value: certified },
    { name: "Pending", value: pending },
    { name: "Declined", value: declined },
  ];

  const COLORS = ["#2e7d32", "#f9a825", "#c62828"];

  return (
    <ResponsiveContainer width="100%" height={250}>
      <PieChart>
        <Pie data={data} dataKey="value" innerRadius={60} outerRadius={90}>
          {data.map((_, i) => (
            <Cell key={i} fill={COLORS[i]} />
          ))}
        </Pie>
        <Tooltip />
      </PieChart>
    </ResponsiveContainer>
  );
}
