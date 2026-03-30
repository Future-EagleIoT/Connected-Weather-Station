import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import AuthLayout from '../components/layouts/AuthLayout';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
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
      <div className="space-y-8 animate-fade-in w-full max-w-sm mx-auto lg:max-w-none">
        <div>
          <h2 className="font-headline text-3xl font-bold text-on-surface tracking-tight">Welcome back</h2>
          <p className="mt-2 text-on-surface-variant">Enter your credentials to access the telemetry dashboard.</p>
        </div>

        {/* Login/Register Toggle */}
        <div className="p-1.5 bg-surface-container-low rounded-full flex">
          <button className="flex-1 py-2 text-sm font-semibold rounded-full bg-surface-container-lowest text-on-surface shadow-sm transition-all">
            Login
          </button>
          <button className="flex-1 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors cursor-pointer">
            Register
          </button>
        </div>

        {/* Form */}
        <form className="space-y-6" onSubmit={handleSubmit}>
          <div className="space-y-4">
            <div>
              <label className="font-label text-xs uppercase tracking-[0.08em] text-outline mb-2 block" htmlFor="email">
                Email Address
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="operator@atmospro.io"
                required
                className="w-full bg-surface-container-high border-none rounded-DEFAULT px-4 py-3 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-all text-on-surface placeholder:text-outline"
              />
            </div>
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="font-label text-xs uppercase tracking-[0.08em] text-outline block" htmlFor="password">
                  Password
                </label>
                <a className="text-xs font-medium text-primary-container hover:underline" href="#forgot">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  required
                  className="w-full bg-surface-container-high border-none rounded-DEFAULT px-4 py-3 focus:bg-surface-container-lowest focus:outline-none focus:ring-2 focus:ring-primary-container/40 transition-all text-on-surface placeholder:text-outline"
                />
                <button className="absolute right-4 top-1/2 -translate-y-1/2 text-outline hover:text-on-surface" type="button" aria-label="Toggle password visibility">
                  <span className="material-symbols-outlined text-[20px]">visibility</span>
                </button>
              </div>
            </div>
          </div>
          
          {error && (
            <div className="px-4 py-3 rounded-lg bg-error-container text-on-error-container text-sm flex items-center gap-2">
               <span className="material-symbols-outlined text-[18px]">error</span>
               {error}
            </div>
          )}

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
            className="w-full py-4 bg-linear-to-r from-primary-container to-secondary-container text-white font-headline font-bold rounded-DEFAULT shadow-lg shadow-primary-container/20 hover:opacity-90 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-75"
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

        {/* Divider */}
        <div className="relative flex items-center py-4">
          <div className="grow border-t border-outline-variant/30"></div>
          <span className="shrink mx-4 font-label text-[10px] uppercase tracking-widest text-outline">
            or authenticate via
          </span>
          <div className="grow border-t border-outline-variant/30"></div>
        </div>

        {/* Social Login */}
        <div className="grid grid-cols-2 gap-4">
          <button type="button" className="flex items-center justify-center gap-3 py-3 border border-outline-variant/30 rounded-DEFAULT hover:bg-surface-container-low transition-colors cursor-pointer">
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"></path>
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"></path>
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" fill="#FBBC05"></path>
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"></path>
            </svg>
            <span className="text-sm font-medium">Google</span>
          </button>
          <button type="button" className="flex items-center justify-center gap-3 py-3 border border-outline-variant/30 rounded-DEFAULT hover:bg-surface-container-low transition-colors cursor-pointer">
            <svg className="w-5 h-5 fill-on-surface" viewBox="0 0 24 24">
              <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.43.372.823 1.102.823 2.222 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"></path>
            </svg>
            <span className="text-sm font-medium">GitHub</span>
          </button>
        </div>

        <p className="text-center text-sm text-on-surface-variant pt-4">
          By signing in, you agree to our{' '}
          <a className="text-primary-container font-medium hover:underline" href="#tos">
            Terms of Service
          </a>{' '}
          and{' '}
          <a className="text-primary-container font-medium hover:underline" href="#privacy">
            Privacy Policy
          </a>.
        </p>
      </div>
    </AuthLayout>
  );
}
