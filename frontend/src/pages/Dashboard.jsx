// ============================================================
//  Dashboard Page — Real-time weather data with charts
// ============================================================

import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getSensorData, getLatestData } from '../api/client';
import StatsCard from '../components/StatsCard';
import WeatherChart from '../components/Charts/WeatherChart';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

const REFRESH_INTERVAL = 30000; // 30 seconds

export default function Dashboard() {
  const metricMap = useMemo(
    () => ({
      temperature: { label: 'Temperature', dataKey: 'temperature', unit: '°C', color: '#f43f5e', gradientId: 'grad-temp' },
      humidity: { label: 'Humidity', dataKey: 'humidity', unit: '%', color: '#3b82f6', gradientId: 'grad-hum' },
      pressure: { label: 'Pressure', dataKey: 'pressure', unit: 'hPa', color: '#8b5cf6', gradientId: 'grad-pres' },
      lux: { label: 'Ambient Light', dataKey: 'lux', unit: 'lx', color: '#f59e0b', gradientId: 'grad-lux' },
    }),
    [],
  );

  const rangeOptions = useMemo(
    () => [
      { id: '1h', label: 'Last 1h', ms: 60 * 60 * 1000, limit: 160 },
      { id: '24h', label: 'Last 24h', ms: 24 * 60 * 60 * 1000, limit: 400 },
      { id: '7d', label: 'Last 7d', ms: 7 * 24 * 60 * 60 * 1000, limit: 900 },
    ],
    [],
  );

  const latestQuery = useQuery({
    queryKey: ['sensor', 'latest'],
    queryFn: async () => (await getLatestData()).data,
    refetchInterval: REFRESH_INTERVAL,
  });

  const [selectedDeviceId, setSelectedDeviceId] = useState(null);
  const [rangeId, setRangeId] = useState('24h');
  const [metricKey, setMetricKey] = useState('temperature');

  useEffect(() => {
    if (latestQuery.data?.length) {
      const nextId =
        latestQuery.data.find((d) => d.device_id === selectedDeviceId)?.device_id ??
        latestQuery.data[0]?.device_id ??
        null;
      setSelectedDeviceId(nextId);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [latestQuery.data]);

  const range = rangeOptions.find((r) => r.id === rangeId) ?? rangeOptions[1];

  const historyQuery = useQuery({
    queryKey: ['sensor', 'history', selectedDeviceId, rangeId],
    queryFn: async () => {
      const end = new Date();
      const start = new Date(Date.now() - range.ms);
      const res = await getSensorData({
        device_id: selectedDeviceId,
        start: start.toISOString(),
        end: end.toISOString(),
        limit: range.limit,
      });

      // API returns newest first; reverse to chronological for the chart.
      return [...res.data].reverse();
    },
    enabled: !!selectedDeviceId,
    refetchInterval: REFRESH_INTERVAL,
  });

  const current = useMemo(() => {
    if (!latestQuery.data?.length) return null;
    return latestQuery.data.find((d) => d.device_id === selectedDeviceId) ?? latestQuery.data[0] ?? null;
  }, [latestQuery.data, selectedDeviceId]);

  const trends = useMemo(() => {
    const history = historyQuery.data ?? [];
    if (history.length < 2) return {};
    const last = history[history.length - 1];
    const prev = history[history.length - 2];
    return {
      temperature: last.temperature - prev.temperature,
      humidity: last.humidity - prev.humidity,
      pressure: last.pressure - prev.pressure,
      lux: last.lux - prev.lux,
    };
  }, [historyQuery.data]);

  if (latestQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 rounded-full animate-spin"
               style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent-blue)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading sensor data...</p>
        </div>
      </div>
    );
  }

  const error = latestQuery.error?.message || historyQuery.error?.message || '';

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>
            Dashboard
          </h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Real-time environmental monitoring
          </p>
        </div>

        <div className="flex items-center gap-3">
          {latestQuery.dataUpdatedAt ? (
            <span className="text-xs px-3 py-1.5 rounded-full" style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-muted)' }}>
              Updated {new Date(latestQuery.dataUpdatedAt).toLocaleTimeString()}
            </span>
          ) : null}

          <div
            className="flex items-center gap-2 px-3 py-1.5 rounded-full"
            style={{ background: 'rgba(16, 185, 129, 0.1)' }}
          >
            <span className="w-2 h-2 rounded-full animate-pulse-glow" style={{ background: 'var(--color-accent-emerald)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-accent-emerald)' }}>
              Live
            </span>
          </div>
        </div>
      </div>

      {error ? (
        <div
          className="glass-card px-5 py-4 text-sm"
          style={{
            background: 'rgba(244, 63, 94, 0.1)',
            color: 'var(--color-accent-rose)',
            borderColor: 'rgba(244, 63, 94, 0.2)',
          }}
        >
          {error}
        </div>
      ) : null}

      {/* Controls */}
      <MotionDiv
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="glass-card p-5"
      >
        <div className="flex flex-col lg:flex-row lg:items-end gap-4">
          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--color-text-muted)' }}>
              Device
            </label>
            <select
              value={selectedDeviceId ?? ''}
              onChange={(e) => setSelectedDeviceId(e.target.value)}
              className="mt-2 w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            >
              {(latestQuery.data ?? []).map((d) => (
                <option key={d.device_id} value={d.device_id}>
                  {d.device_name ?? d.device_id}
                </option>
              ))}
            </select>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--color-text-muted)' }}>
              Time range
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {rangeOptions.map((r) => {
                const active = r.id === rangeId;
                return (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setRangeId(r.id)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    style={{
                      background: active ? `linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-purple))` : 'transparent',
                      color: active ? '#fff' : 'var(--color-text-secondary)',
                      border: active ? '1px solid transparent' : '1px solid var(--color-border)',
                    }}
                  >
                    {r.label}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="flex-1">
            <label className="block text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--color-text-muted)' }}>
              Metric
            </label>
            <div className="mt-2 flex flex-wrap gap-2">
              {Object.keys(metricMap).map((key) => {
                const active = key === metricKey;
                const m = metricMap[key];
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setMetricKey(key)}
                    className="px-3 py-2 rounded-xl text-xs font-semibold transition-colors cursor-pointer"
                    style={{
                      background: active ? `${m.color}1a` : 'transparent',
                      color: active ? m.color : 'var(--color-text-secondary)',
                      border: active ? `1px solid ${m.color}55` : '1px solid var(--color-border)',
                    }}
                  >
                    {m.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </MotionDiv>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Temperature" value={current?.temperature} unit="°C"
          icon="🌡️" color="var(--color-accent-rose)" trend={trends.temperature} delay={1}
        />
        <StatsCard
          title="Humidity" value={current?.humidity} unit="%"
          icon="💧" color="var(--color-accent-blue)" trend={trends.humidity} delay={2}
        />
        <StatsCard
          title="Pressure" value={current?.pressure} unit="hPa"
          icon="🌀" color="var(--color-accent-purple)" trend={trends.pressure} delay={3}
        />
        <StatsCard
          title="Light" value={current?.lux} unit="lx"
          icon="☀️" color="var(--color-accent-amber)" trend={trends.lux} delay={4}
        />
      </div>

      {/* Device info */}
      {current?.device_name ? (
        <MotionDiv
          initial={{ opacity: 0, y: 4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25 }}
          className="glass-card px-5 py-3 flex items-center gap-3"
        >
          <span className="text-lg">📡</span>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-medium truncate" style={{ color: 'var(--color-text-primary)' }}>
                {current.device_name}
              </span>
              <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
                • {current.location ? current.location : 'Location not set'}
              </span>
            </div>
            <span className="text-xs block" style={{ color: 'var(--color-text-muted)' }}>
              Last reading: {current.recorded_at ? new Date(current.recorded_at).toLocaleString() : 'N/A'}
            </span>
          </div>
        </MotionDiv>
      ) : null}

      {/* Chart */}
      {historyQuery.isLoading ? (
        <div className="glass-card p-12 text-center">
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading chart...</p>
        </div>
      ) : historyQuery.data?.length > 1 ? (
        <WeatherChart
          data={historyQuery.data}
          dataKey={metricMap[metricKey].dataKey}
          name={metricMap[metricKey].label}
          color={metricMap[metricKey].color}
          unit={metricMap[metricKey].unit}
          gradientId={metricMap[metricKey].gradientId}
        />
      ) : (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-4">📈</p>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>
            Waiting for data
          </h3>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            Charts will appear once your ESP32 starts sending readings.
          </p>
        </div>
      )}
    </div>
  );
}
