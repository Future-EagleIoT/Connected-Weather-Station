// ============================================================
//  Stats Card — Displays a single metric with trend indicator
// ============================================================

export default function StatsCard({ title, value, unit, icon, color, trend, delay = 0 }) {
  const trendColor = trend > 0 ? 'var(--color-accent-emerald)' : trend < 0 ? 'var(--color-accent-rose)' : 'var(--color-text-muted)';
  const trendIcon = trend > 0 ? '↑' : trend < 0 ? '↓' : '→';

  const animationDelayMs = Math.max(0, delay * 120);

  return (
    <div
      className="glass-card p-6 animate-fade-in"
      style={{ opacity: 0, animationDelay: `${animationDelayMs}ms` }}
    >
      <div className="flex items-start justify-between mb-4">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center text-xl"
          style={{ background: `${color}15`, color }}
        >
          {icon}
        </div>
        {trend !== undefined && (
          <div className="flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold"
               style={{ background: `${trendColor}15`, color: trendColor }}>
            <span>{trendIcon}</span>
            <span>{Math.abs(trend).toFixed(1)}</span>
          </div>
        )}
      </div>

      <p className="text-sm font-medium mb-1" style={{ color: 'var(--color-text-secondary)' }}>
        {title}
      </p>
      <div className="flex items-baseline gap-1.5">
        <span className="text-3xl font-bold tracking-tight" style={{ color: 'var(--color-text-primary)' }}>
          {typeof value === 'number' ? value.toFixed(1) : value ?? '—'}
        </span>
        <span className="text-sm font-medium" style={{ color: 'var(--color-text-muted)' }}>
          {unit}
        </span>
      </div>
    </div>
  );
}
