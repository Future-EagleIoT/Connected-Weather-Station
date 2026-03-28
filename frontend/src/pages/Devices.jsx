// ============================================================
//  Devices Page — List and register ESP32 weather stations
// ============================================================

import { useState, useEffect } from 'react';
import { getDevices, createDevice } from '../api/client';
import { useAuth } from '../context/AuthContext';

export default function Devices() {
  const { user } = useAuth();
  const [devices, setDevices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [newKey, setNewKey] = useState('');
  const [formLoading, setFormLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    getDevices()
      .then((res) => setDevices(res.data))
      .catch(() => setError('Failed to load devices'))
      .finally(() => setLoading(false));
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setFormLoading(true);
    setError('');

    try {
      const res = await createDevice(name, location || null);
      setNewKey(res.data.api_key);
      setDevices((prev) => [res.data, ...prev]);
      setName('');
      setLocation('');
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to create device');
    } finally {
      setFormLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-3 rounded-full animate-spin"
             style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent-blue)' }} />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--color-text-primary)' }}>Devices</h1>
          <p className="text-sm mt-1" style={{ color: 'var(--color-text-muted)' }}>
            Manage your ESP32 weather stations
          </p>
        </div>
        {user?.is_admin && (
          <button
            onClick={() => { setShowForm(!showForm); setNewKey(''); }}
            className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer"
            style={{ background: 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-cyan))' }}
            onMouseEnter={(e) => e.target.style.transform = 'translateY(-1px)'}
            onMouseLeave={(e) => e.target.style.transform = 'none'}
          >
            + Add Device
          </button>
        )}
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

      {/* New device form */}
      {showForm && (
        <div className="glass-card p-6 animate-fade-in" style={{ opacity: 0 }}>
          <h3 className="text-base font-semibold mb-4" style={{ color: 'var(--color-text-primary)' }}>
            Register New Device
          </h3>

          {newKey ? (
            <div className="space-y-4">
              <div className="px-4 py-3 rounded-xl text-sm" style={{
                background: 'rgba(16, 185, 129, 0.1)',
                color: 'var(--color-accent-emerald)',
                border: '1px solid rgba(16, 185, 129, 0.2)',
              }}>
                ✅ Device created! Save this API key — it won't be shown again.
              </div>
              <div className="px-4 py-3 rounded-xl font-mono text-sm break-all" style={{
                background: 'var(--color-bg-primary)',
                color: 'var(--color-accent-amber)',
                border: '1px solid var(--color-border)',
              }}>
                {newKey}
              </div>
              <button onClick={() => { navigator.clipboard.writeText(newKey); }}
                className="px-4 py-2 rounded-lg text-sm font-medium transition-colors cursor-pointer"
                style={{ background: 'var(--color-bg-card)', color: 'var(--color-text-secondary)', border: '1px solid var(--color-border)' }}>
                📋 Copy to Clipboard
              </button>
            </div>
          ) : (
            <form onSubmit={handleCreate} className="flex flex-col sm:flex-row gap-3">
              <input
                value={name} onChange={(e) => setName(e.target.value)}
                placeholder="Device name (e.g. Station Alpha)"
                required
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-blue)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
              <input
                value={location} onChange={(e) => setLocation(e.target.value)}
                placeholder="Location (optional)"
                className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none"
                style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
                onFocus={(e) => e.target.style.borderColor = 'var(--color-accent-blue)'}
                onBlur={(e) => e.target.style.borderColor = 'var(--color-border)'}
              />
              <button type="submit" disabled={formLoading}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-cyan))' }}>
                {formLoading ? 'Creating...' : 'Create'}
              </button>
            </form>
          )}
        </div>
      )}

      {/* Device list */}
      <div className="grid gap-4">
        {devices.length === 0 ? (
          <div className="glass-card p-12 text-center">
            <p className="text-4xl mb-4">📡</p>
            <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>No devices yet</h3>
            <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
              Register your first ESP32 weather station to get started.
            </p>
          </div>
        ) : (
          devices.map((device, i) => (
            <div key={device.id} className={`glass-card p-5 flex items-center gap-4 animate-fade-in delay-${i + 1}`}
                 style={{ opacity: 0 }}>
              <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl shrink-0"
                   style={{
                     background: device.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                     color: device.is_active ? 'var(--color-accent-emerald)' : 'var(--color-accent-rose)',
                   }}>
                📡
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                    {device.name}
                  </h3>
                  <span className="px-2 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          background: device.is_active ? 'rgba(16, 185, 129, 0.1)' : 'rgba(244, 63, 94, 0.1)',
                          color: device.is_active ? 'var(--color-accent-emerald)' : 'var(--color-accent-rose)',
                        }}>
                    {device.is_active ? 'Active' : 'Inactive'}
                  </span>
                </div>
                <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-muted)' }}>
                  {device.location || 'No location set'} • Registered {new Date(device.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="text-xs font-mono px-3 py-1.5 rounded-lg shrink-0 hidden sm:block"
                   style={{ background: 'var(--color-bg-primary)', color: 'var(--color-text-muted)' }}>
                {device.id?.slice(0, 8)}...
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
