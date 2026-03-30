import React from 'react';

export default function AuthLayout({ children }) {
  return (
    <div className="min-h-screen flex selection:bg-primary-fixed selection:text-on-primary-fixed">
      {/* Visual Side */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-surface-container-low p-12 flex-col justify-between">
        <div className="relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center">
              <span className="material-symbols-outlined text-white" style={{ fontVariationSettings: "'FILL' 1" }}>cloudy_snowing</span>
            </div>
            <span className="font-headline font-bold text-2xl tracking-tight text-on-surface">AtmosPro</span>
          </div>
          <div className="mt-20">
            <h1 className="font-headline text-5xl font-bold text-on-surface leading-tight">
              Precision telemetry <br />
              <span className="text-primary-container">at the atmospheric edge.</span>
            </h1>
            <p className="mt-6 text-on-surface-variant text-lg max-w-md font-body leading-relaxed">
              Connect your ESP32-based sensors and visualize real-time meteorological data with laboratory-grade precision.
            </p>
          </div>
        </div>

        {/* Background Visual Image */}
        <div className="absolute inset-0 z-0 bg-surface-dim">
          <img
            alt="Weather station setup"
            className="w-full h-full object-cover opacity-20 mix-blend-multiply grayscale"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBYvZ6nW5oraRbiKkqvRs5cqxyvQlSARcYtCAvUL38iZACi3KII03vlJNjhYhB1G_UVJiVnXAEShOk93dhm8mcai9msMNbztt4vCDaAaUNKhGA13CYCYE9uoZ5MdUiIVMxD71f3QOpgEiEtHzskdp8lZYcy20xBso-7iQpq3O-5MIM69ZDP3ank6mqbfz9ZoN35zoKHwV_9vRbs_zxdXna34dCuvDhOyCvwLSmtCNteJdu2oAXHDNz0rZEC3Nz3uDj675yB8ZRUTWg"
          />
          <div className="absolute inset-0 bg-linear-to-tr from-surface-container-low via-transparent to-transparent" />
        </div>

        {/* Stats/Labeling Area */}
        <div className="relative z-10 flex gap-8">
          <div>
            <span className="font-label text-xs uppercase tracking-[0.08em] text-outline">active nodes</span>
            <div className="font-label text-2xl text-on-surface">14,282</div>
          </div>
          <div>
            <span className="font-label text-xs uppercase tracking-[0.08em] text-outline">uptime</span>
            <div className="font-label text-2xl text-on-surface">99.98%</div>
          </div>
        </div>
      </div>

      {/* Authentication Canvas */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 md:p-12 bg-surface">
        <div className="w-full max-w-md">
          {/* Mobile Branding */}
          <div className="lg:hidden flex items-center gap-3 mb-12">
            <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
              <span className="material-symbols-outlined text-white text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>cloudy_snowing</span>
            </div>
            <span className="font-headline font-bold text-xl tracking-tight text-on-surface">AtmosPro</span>
          </div>

          {children}
        </div>
      </div>
      
      {/* Floating Atmosphere Indicator (Purely Aesthetic) */}
      <div className="fixed bottom-8 right-8 pointer-events-none hidden md:block z-50">
        <div className="glass-panel p-4 rounded-lg shadow-lg border border-outline-variant/20 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-tertiary shadow-[0_0_8px_rgba(0,98,66,0.5)]"></span>
            <span className="font-label text-[10px] uppercase tracking-widest text-on-surface">Cloud API Online</span>
          </div>
          <div className="w-px h-4 bg-outline-variant/30"></div>
          <div className="font-label text-xs text-primary-container">v4.2.1-stable</div>
        </div>
      </div>
    </div>
  );
}
