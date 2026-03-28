// ============================================================
//  Dashboard Page — Real-time weather data with charts
// ============================================================

import { useState, useEffect, useCallback } from 'react';
import { getSensorData, getLatestData } from '../api/client';
import StatsCard from '../components/StatsCard';
import WeatherChart from '../components/Charts/WeatherChart';

const REFRESH_INTERVAL = 30000; // 30 seconds

export default function Dashboard() {
  const [latest, setLatest] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [lastUpdate, setLastUpdate] = useState(null);

  const fetchData = useCallback(async () => {
    try {
      const [latestRes, historyRes] = await Promise.all([
        getLatestData(),
        getSensorData({ limit: 50 }),
      ]);
      setLatest(latestRes.data);
      // Reverse for chronological order in charts
      setHistory([...historyRes.data].reverse());
      setLastUpdate(new Date());
      setError('');
    } catch (err) {
      setError('Failed to load sensor data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, REFRESH_INTERVAL);
    return () => clearInterval(interval);
  }, [fetchData]);

  // Get the first device's latest reading for stat cards
  const current = latest[0] || {};

  // Calculate trends (compare last 2 readings)
  const prev = history.length >= 2 ? history[history.length - 2] : null;
  const trends = prev ? {
    temperature: current.temperature - prev.temperature,
    humidity: current.humidity - prev.humidity,
    pressure: current.pressure - prev.pressure,
    lux: current.lux - prev.lux,
  } : {};

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-3 rounded-full animate-spin"
               style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent-blue)' }} />
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>Loading sensor data...</p>
        </div>
      </div>
    );
  }

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
          {lastUpdate && (
            <span className="text-xs px-3 py-1.5 rounded-full"
                  style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-muted)' }}>
              Updated {lastUpdate.toLocaleTimeString()}
            </span>
          )}
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
               style={{ background: 'rgba(16, 185, 129, 0.1)' }}>
            <span className="w-2 h-2 rounded-full animate-pulse-glow"
                  style={{ background: 'var(--color-accent-emerald)' }} />
            <span className="text-xs font-medium" style={{ color: 'var(--color-accent-emerald)' }}>
              Live
            </span>
          </div>
        </div>
      </div>

      {error && (
        <div className="glass-card px-5 py-4 text-sm" style={{
          background: 'rgba(244, 63, 94, 0.1)',
          color: 'var(--color-accent-rose)',
          borderColor: 'rgba(244, 63, 94, 0.2)',
        }}>
          {error}
        </div>
      )}

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard
          title="Temperature" value={current.temperature} unit="°C"
          icon="🌡️" color="var(--color-accent-rose)" trend={trends.temperature} delay={1}
        />
        <StatsCard
          title="Humidity" value={current.humidity} unit="%"
          icon="💧" color="var(--color-accent-blue)" trend={trends.humidity} delay={2}
        />
        <StatsCard
          title="Pressure" value={current.pressure} unit="hPa"
          icon="🌀" color="var(--color-accent-purple)" trend={trends.pressure} delay={3}
        />
        <StatsCard
          title="Light" value={current.lux} unit="lx"
          icon="☀️" color="var(--color-accent-amber)" trend={trends.lux} delay={4}
        />
      </div>

      {/* Device info */}
      {current.device_name && (
        <div className="glass-card px-5 py-3 flex items-center gap-3 animate-fade-in" style={{ opacity: 0 }}>
          <span className="text-lg">📡</span>
          <div>
            <span className="text-sm font-medium" style={{ color: 'var(--color-text-primary)' }}>
              {current.device_name}
            </span>
            <span className="mx-2 text-xs" style={{ color: 'var(--color-text-muted)' }}>•</span>
            <span className="text-xs" style={{ color: 'var(--color-text-muted)' }}>
              Last reading: {current.recorded_at ? new Date(current.recorded_at).toLocaleString() : 'N/A'}
            </span>
          </div>
        </div>
      )}

      {/* Charts */}
      {history.length > 1 ? (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <WeatherChart
            data={history} dataKey="temperature" name="Temperature"
            color="#f43f5e" unit="°C" gradientId="grad-temp"
          />
          <WeatherChart
            data={history} dataKey="humidity" name="Humidity"
            color="#3b82f6" unit="%" gradientId="grad-hum"
          />
          <WeatherChart
            data={history} dataKey="pressure" name="Pressure"
            color="#8b5cf6" unit="hPa" gradientId="grad-pres"
          />
          <WeatherChart
            data={history} dataKey="lux" name="Ambient Light"
            color="#f59e0b" unit="lx" gradientId="grad-lux"
          />
        </div>
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
