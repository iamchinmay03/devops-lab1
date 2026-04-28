import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import useAuthStore from '../context/authStore';

export default function LoginPage() {
  const [form, setForm] = useState({ email: '', password: '' });
  const { login, loading } = useAuthStore();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const result = await login(form.email, form.password);
    if (result.success) {
      navigate(result.role === 'student' ? '/student/dashboard' : '/coordinator/dashboard');
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Left Panel - Professional Gradient */}
      <div className="hidden lg:flex flex-col justify-between w-5/12 relative overflow-hidden"
           style={{ background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%)' }}>
        {/* Decorative elements */}
        <div className="absolute inset-0" style={{ 
          backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(37, 99, 235, 0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(124, 58, 237, 0.1) 0%, transparent 50%)' 
        }} />
        <div className="absolute top-0 left-0 w-full h-1" style={{ 
          background: 'linear-gradient(90deg, #2563eb, #06b6d4, #7c3aed)' 
        }} />
        
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 opacity-5" style={{ 
          backgroundImage: 'linear-gradient(rgba(255,255,255,0.1) 1px,transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.1) 1px,transparent 1px)',
          backgroundSize: '40px 40px'
        }} />

        <div className="relative z-10 p-12 flex flex-col h-full">
          <Link to="/" className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center backdrop-blur-sm border border-white/20">
              <svg viewBox="0 0 40 40" className="w-8 h-8" fill="none">
                <rect width="40" height="40" rx="10" fill="url(#logoGrad)"/>
                <path d="M12 28L20 12L28 28H12Z" fill="white" opacity="0.9"/>
                <circle cx="20" cy="22" r="3" fill="white"/>
                <defs>
                  <linearGradient id="logoGrad" x1="0" y1="0" x2="40" y2="40">
                    <stop stopColor="#2563eb"/>
                    <stop offset="1" stopColor="#7c3aed"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="text-white font-display font-bold text-2xl">PlaceNova</span>
          </Link>

          <div className="flex-1 flex flex-col justify-center">
            <h2 className="text-4xl font-display font-bold text-white leading-tight mb-6"
                style={{ lineHeight: '1.2' }}>
              Welcome back to<br/>
              <span className="grad-text">Placement Hub</span>
            </h2>
            <p className="text-white/60 text-lg mb-10 max-w-md">
              Track your placement journey, manage applications, and connect with top companies — all in one place.
            </p>
            
            {/* Stats */}
            <div className="grid grid-cols-2 gap-4">
              {[
                { val: '500+', label: 'Students Placed', color: '#2563eb' },
                { val: '120+', label: 'Partner Companies', color: '#06b6d4' },
                { val: '₹18 LPA', label: 'Avg Package', color: '#7c3aed' },
                { val: '94%', label: 'Success Rate', color: '#10b981' },
              ].map((stat, i) => (
                <div key={i} className="p-4 rounded-xl bg-white/5 border border-white/10 backdrop-blur-sm">
                  <div className="text-2xl font-display font-bold" style={{ color: stat.color }}>{stat.val}</div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-white/30 text-sm">© 2024 PlaceNova. All rights reserved.</div>
        </div>
      </div>

      {/* Right Panel - Clean Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-surface-50">
        <div className="w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden flex items-center gap-3 mb-8">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center">
              <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
                <rect width="40" height="40" rx="10" fill="url(#logoGrad2)"/>
                <path d="M12 28L20 12L28 28H12Z" fill="white" opacity="0.9"/>
                <circle cx="20" cy="22" r="3" fill="white"/>
                <defs>
                  <linearGradient id="logoGrad2" x1="0" y1="0" x2="40" y2="40">
                    <stop stopColor="#2563eb"/>
                    <stop offset="1" stopColor="#7c3aed"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="font-display font-bold text-xl text-slate-900">PlaceNova</span>
          </div>

          <div className="mb-8">
            <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Sign in</h1>
            <p className="text-slate-500">Enter your credentials to access your dashboard</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Email address</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                  </svg>
                </div>
                <input type="email" className="form-input pl-12" placeholder="you@example.com" required
                  value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
              </div>
            </div>
            <div>
              <label className="form-label">Password</label>
              <div className="relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                  </svg>
                </div>
                <input type="password" className="form-input pl-12" placeholder="••••••••" required
                  value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-base">
              {loading ? (
                <span className="flex items-center gap-2"><span className="spinner w-5 h-5" /> Signing in...</span>
              ) : (
                <span className="flex items-center gap-2">Sign In →</span>
              )}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 p-4 rounded-xl" style={{ 
            background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.05), rgba(124, 58, 237, 0.05))',
            border: '1px solid rgba(37, 99, 235, 0.15)'
          }}>
            <p className="text-xs font-bold text-slate-600 mb-2">🎓 Demo Accounts</p>
            <div className="space-y-1 text-xs text-slate-500">
              <p><strong>Student:</strong> student@demo.com / demo123</p>
              <p><strong>Coordinator:</strong> coordinator@demo.com / demo123</p>
            </div>
          </div>

          <p className="text-center text-slate-500 text-sm mt-8">
            Don't have an account?{' '}
            <Link to="/register" className="font-semibold bg-gradient-to-r from-blue-600 to-violet-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity">
              Sign up free
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
