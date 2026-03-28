// ============================================================
//  WeatherChart — Reusable time-series chart component
// ============================================================

import {
  ResponsiveContainer, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
} from 'recharts';

const formatTime = (ts) => {
  const d = new Date(ts);
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

const CustomTooltip = ({ active, payload, label }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="glass-card px-4 py-3" style={{ minWidth: 140 }}>
      <p className="text-xs mb-2 font-medium" style={{ color: 'var(--color-text-muted)' }}>
        {new Date(label).toLocaleString()}
      </p>
      {payload.map((entry, i) => (
        <div key={i} className="flex justify-between gap-4 text-sm">
          <span style={{ color: entry.color }}>{entry.name}</span>
          <span className="font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {entry.value?.toFixed(1)}
          </span>
        </div>
      ))}
    </div>
  );
};

export default function WeatherChart({ data, dataKey, name, color, unit, gradientId }) {
  const gId = gradientId || `gradient-${dataKey}`;

  return (
    <div className="glass-card p-6 animate-fade-in" style={{ opacity: 0 }}>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-semibold" style={{ color: 'var(--color-text-primary)' }}>
            {name}
          </h3>
          <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
            Last {data.length} readings
          </p>
        </div>
        <div className="px-3 py-1 rounded-full text-xs font-medium"
             style={{ background: `${color}15`, color }}>
          {unit}
        </div>
      </div>

      <div style={{ width: '100%', height: 240 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 5, right: 5, bottom: 5, left: -10 }}>
            <defs>
              <linearGradient id={gId} x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.08)" />
            <XAxis
              dataKey="recorded_at"
              tickFormatter={formatTime}
              stroke="var(--color-text-muted)"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              stroke="var(--color-text-muted)"
              tick={{ fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={dataKey}
              name={name}
              stroke={color}
              strokeWidth={2.5}
              fill={`url(#${gId})`}
              dot={false}
              activeDot={{ r: 5, fill: color, stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
