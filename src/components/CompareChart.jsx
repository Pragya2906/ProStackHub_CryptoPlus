import {CartesianGrid,Legend,Line,LineChart,ResponsiveContainer,Tooltip,XAxis,YAxis,} from "recharts";
import { formatChartDate, formatChartDateTime } from "@/utils/format";
const axisStyle = { fontFamily: "var(--font-mono)", fontSize: 10 };

export function CompareChart({ rows, series, height = 320 }) {
  return (
    <div
      style={{ height }}
      role="img"
      aria-label={`7-day relative performance for ${series.map((s) => s.name).join(" and ")}`}>
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={rows} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="t"
            type="number"
            domain={["dataMin", "dataMax"]}
            tickFormatter={formatChartDate}
            tick={{ ...axisStyle, fill: "var(--color-muted)" }}
            axisLine={{ stroke: "var(--color-border)" }}
            tickLine={false}
            minTickGap={40}
          />
          <YAxis
            width={56}
            tickFormatter={(value) => `${value > 0 ? "+" : ""}${value.toFixed(1)}%`}
            tick={{ ...axisStyle, fill: "var(--color-muted)" }}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            cursor={{ stroke: "var(--color-border)" }}
            contentStyle={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
              borderRadius: 10,
              fontFamily: "var(--font-mono)",
              fontSize: 12,
              color: "var(--color-foreground)",
            }}
            labelFormatter={(value) => formatChartDateTime(Number(value))}
            formatter={(value, name) => [
              `${Number(value) > 0 ? "+" : ""}${Number(value).toFixed(2)}%`,
              String(name),
            ]}
          />
          <Legend
            verticalAlign="top"
            height={28}
            wrapperStyle={{ fontFamily: "var(--font-mono)", fontSize: 11 }}
          />
          {series.map((item) => (
            <Line
              key={item.key}
              type="monotone"
              dataKey={item.key}
              name={item.name}
              stroke={item.color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 3 }}
              isAnimationActive={false}
              connectNulls
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
