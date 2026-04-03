// ============================================================
//  Devices Page — List and register ESP32 weather stations
// ============================================================

import { useMemo, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { createDevice, deactivateDevice, getDevices } from '../api/client';
import { useAuth } from '../context/AuthContext';

const MotionDiv = motion.div;

export default function Devices() {
  const { user } = useAuth();
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [location, setLocation] = useState('');
  const [newKey, setNewKey] = useState('');
  const [error, setError] = useState('');

  const [search, setSearch] = useState('');

  const devicesQuery = useQuery({
    queryKey: ['devices'],
    queryFn: async () => (await getDevices()).data,
  });

  const filteredDevices = useMemo(() => {
    const list = devicesQuery.data ?? [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter((d) => `${d.name ?? ''} ${d.location ?? ''} ${d.id ?? ''}`.toLowerCase().includes(q));
  }, [devicesQuery.data, search]);

  const createMutation = useMutation({
    mutationFn: async ({ name, location }) => createDevice(name, location),
    onSuccess: (res) => {
      setNewKey(res.data.api_key);
      setName('');
      setLocation('');
      setError('');
      devicesQuery.refetch();
    },
    onError: (err) => setError(err.response?.data?.detail || 'Failed to create device'),
  });

  const deactivateMutation = useMutation({
    mutationFn: async (deviceId) => deactivateDevice(deviceId),
    onSuccess: () => {
      setError('');
      devicesQuery.refetch();
    },
    onError: (err) => setError(err.response?.data?.detail || 'Failed to deactivate device'),
  });

  const handleCreate = (e) => {
    e.preventDefault();
    setError('');
    createMutation.mutate({ name, location: location || null });
  };

  const handleDeactivate = (deviceId) => {
    setError('');
    deactivateMutation.mutate(deviceId);
  };

  if (devicesQuery.isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="w-12 h-12 border-4 rounded-full animate-spin" style={{ borderColor: 'var(--color-border)', borderTopColor: 'var(--color-accent-blue)' }} />
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

        <div className="flex flex-col sm:items-end gap-3 sm:flex-row">
          <div className="w-full sm:w-72">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search devices..."
              className="w-full rounded-xl px-4 py-3 text-sm outline-none"
              style={{ background: 'var(--color-bg-primary)', border: '1px solid var(--color-border)', color: 'var(--color-text-primary)' }}
            />
          </div>

          {user?.is_admin ? (
            <button
              onClick={() => {
                setShowForm(!showForm);
                setNewKey('');
                setError('');
              }}
              className="px-5 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer"
              style={{ background: 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-cyan))' }}
            >
              + Add Device
            </button>
          ) : null}
        </div>
      </div>

      {error ? (
        <div className="glass-card px-5 py-4 text-sm" style={{
          background: 'rgba(244, 63, 94, 0.1)',
          color: 'var(--color-accent-rose)',
          borderColor: 'rgba(244, 63, 94, 0.2)',
        }}>
          {error}
        </div>
      ) : null}

      {/* New device form */}
      {showForm && (
        <MotionDiv initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.25 }} className="glass-card p-6">
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
              <button type="submit" disabled={createMutation.isPending}
                className="px-6 py-2.5 rounded-xl text-sm font-semibold text-white transition-all cursor-pointer disabled:opacity-50 whitespace-nowrap"
                style={{ background: 'linear-gradient(135deg, var(--color-accent-blue), var(--color-accent-cyan))' }}>
                {createMutation.isPending ? 'Creating...' : 'Create'}
              </button>
            </form>
          )}
        </MotionDiv>
      )}

      {/* Device list */}
      {filteredDevices.length === 0 ? (
        <div className="glass-card p-12 text-center">
          <p className="text-4xl mb-4">📡</p>
          <h3 className="font-semibold mb-2" style={{ color: 'var(--color-text-primary)' }}>No devices found</h3>
          <p className="text-sm" style={{ color: 'var(--color-text-muted)' }}>
            {user?.is_admin ? 'Register your first ESP32 weather station to get started.' : 'Ask your administrator to register a device.'}
          </p>
        </div>
      ) : (
        <div className="glass-card overflow-hidden">
          <div className="grid grid-cols-12 gap-2 px-5 py-3 text-xs font-semibold uppercase tracking-[0.08em]" style={{ color: 'var(--color-text-muted)' }}>
            <div className="col-span-5">Device</div>
            <div className="col-span-3">Status</div>
            <div className="col-span-2 hidden md:block">Registered</div>
            <div className="col-span-2 text-right">Actions</div>
          </div>
          <div>
            {filteredDevices.map((device) => {
              const active = !!device.is_active;
              return (
                <MotionDiv
                  key={device.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  className="grid grid-cols-12 gap-2 px-5 py-4"
                  style={{ borderTop: '1px solid rgba(195, 198, 215, 0.25)' }}
                >
                  <div className="col-span-5 min-w-0 flex items-center gap-3">
                    <div
                      className="w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0"
                      style={{
                        background: active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                        color: active ? 'var(--color-accent-emerald)' : 'var(--color-accent-rose)',
                      }}
                    >
                      📡
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-semibold text-sm" style={{ color: 'var(--color-text-primary)' }}>
                        {device.name}
                      </h3>
                      <div className="text-xs truncate" style={{ color: 'var(--color-text-muted)' }}>
                        {device.location || 'No location set'}
                      </div>
                    </div>
                  </div>

                  <div className="col-span-3 flex items-center">
                    <span
                      className="px-3 py-1 rounded-full text-xs font-semibold"
                      style={{
                        background: active ? 'rgba(16, 185, 129, 0.12)' : 'rgba(244, 63, 94, 0.12)',
                        color: active ? 'var(--color-accent-emerald)' : 'var(--color-accent-rose)',
                        border: `1px solid ${active ? 'rgba(16,185,129,0.25)' : 'rgba(244,63,94,0.25)'}`,
                      }}
                    >
                      {active ? 'Active' : 'Inactive'}
                    </span>
                  </div>

                  <div className="col-span-2 hidden md:block text-sm" style={{ color: 'var(--color-text-muted)' }}>
                    {device.created_at ? new Date(device.created_at).toLocaleDateString() : '—'}
                  </div>

                  <div className="col-span-2 text-right">
                    {user?.is_admin ? (
                      <button
                        type="button"
                        disabled={!active || deactivateMutation.isPending}
                        onClick={() => handleDeactivate(device.id)}
                        className="px-3 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer disabled:opacity-50"
                        style={{
                          background: active ? 'rgba(244, 63, 94, 0.1)' : 'rgba(148, 163, 184, 0.08)',
                          color: active ? 'var(--color-accent-rose)' : 'var(--color-text-muted)',
                          border: `1px solid ${active ? 'rgba(244,63,94,0.25)' : 'rgba(148,163,184,0.25)'}`,
                        }}
                      >
                        {deactivateMutation.isPending ? 'Updating...' : 'Deactivate'}
                      </button>
                    ) : null}
                  </div>
                </MotionDiv>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
