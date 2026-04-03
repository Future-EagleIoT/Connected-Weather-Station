import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/layouts/AuthLayout';
import { motion } from 'framer-motion';

const MotionDiv = motion.div;

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      await login(email, password);
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.detail || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthLayout>
      <MotionDiv
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className="w-full max-w-md mx-auto lg:max-w-none"
      >
        <div className="glass-card p-8 sm:p-10 space-y-7">
          <div className="flex items-start justify-between gap-4">
            <div className="min-w-0">
              <div
                className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold"
                style={{ background: 'rgba(37, 99, 235, 0.14)', color: 'var(--color-accent-blue)' }}
              >
                <span className="material-symbols-outlined text-[16px]">cloudy_snowing</span>
                Operator Access
              </div>
              <h2 className="mt-3 font-headline text-4xl font-bold text-on-surface tracking-tight">
                Sign in
              </h2>
              <p className="mt-2 text-on-surface-variant text-sm">
                Securely view sensor telemetry and device status in real time.
              </p>
            </div>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="space-y-4">
              <div>
                <label className="font-label text-xs uppercase tracking-[0.08em] text-outline mb-2 block" htmlFor="email">
                  Email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="operator@eagle-iot.com"
                  required
                  className="w-full rounded-DEFAULT px-4 py-3 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-all text-on-surface placeholder:text-outline"
                  style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-container-high)' }}
                />
              </div>

              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="font-label text-xs uppercase tracking-[0.08em] text-outline block" htmlFor="password">
                    Password
                  </label>
                  <span className="text-xs font-medium text-primary-container" aria-hidden="true">
                    JWT authentication
                  </span>
                </div>
                <div className="relative">
                  <input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    required
                    className="w-full rounded-DEFAULT px-4 py-3 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-all text-on-surface placeholder:text-outline"
                    style={{ border: '1px solid var(--color-border)', background: 'var(--color-surface-container-high)' }}
                  />
                  <button
                    className="absolute right-2 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface rounded-lg p-2 border transition-colors"
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword((v) => !v)}
                    style={{
                      background: 'var(--color-surface-container-lowest)',
                      borderColor: 'var(--color-border)',
                    }}
                  >
                    <span className="material-symbols-outlined text-[20px]">
                      {showPassword ? 'visibility_off' : 'visibility'}
                    </span>
                  </button>
                </div>
              </div>
            </div>

            {error ? (
              <div className="px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px]">error</span>
                {error}
              </div>
            ) : null}

            <div className="flex items-center gap-3">
              <input
                id="remember"
                type="checkbox"
                className="w-5 h-5 rounded border-none bg-surface-container-high text-primary focus:ring-primary-container/40"
              />
              <label className="text-sm text-on-surface-variant font-medium cursor-pointer select-none" htmlFor="remember">
                Keep session active for 30 days
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-white font-headline font-bold rounded-DEFAULT shadow-lg shadow-primary-container/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-75"
              style={{
                background: 'linear-gradient(135deg, var(--color-primary-container), var(--color-secondary-container))',
                border: '1px solid rgba(255,255,255,0.18)',
              }}
            >
              {loading ? (
                <>
                  <span className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></span>
                  Authenticating...
                </>
              ) : (
                'Sign in to Dashboard'
              )}
            </button>
          </form>

          <div
            className="px-5 py-4 rounded-xl text-sm flex items-start gap-3"
            style={{
              background: 'rgba(16, 185, 129, 0.08)',
              color: 'var(--color-accent-emerald)',
              border: '1px solid rgba(16, 185, 129, 0.18)',
            }}
          >
            <span className="material-symbols-outlined text-[18px] leading-none">info</span>
            <span>
              Need access? Ask your admin to create an operator account for the dashboard.
            </span>
          </div>
        </div>
      </MotionDiv>
    </AuthLayout>
  );
}
