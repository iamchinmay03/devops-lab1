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
      {/* Left Panel */}
      <div className="hidden lg:flex flex-col justify-between w-1/2 hero-gradient p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-mesh opacity-10" />
        <Link to="/" className="flex items-center gap-2.5 relative z-10">
          <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur-sm">
            <span className="text-white font-bold">PT</span>
          </div>
          <span className="text-white font-bold text-xl">PlaceNova</span>
        </Link>
        <div className="relative z-10">
          <h2 className="text-4xl font-extrabold text-white leading-tight mb-4">
            Track every step of your<br />placement journey
          </h2>
          <p className="text-white/60 text-lg">Apply, track, and celebrate — all in one place.</p>
          <div className="mt-10 grid grid-cols-2 gap-4">
            {[['500+','Placements'],['120+','Companies'],['₹18 LPA','Avg Package'],['94%','Success Rate']].map(([v,l]) => (
              <div key={l} className="glass-panel p-4">
                <div className="text-2xl font-extrabold text-white">{v}</div>
                <div className="text-white/60 text-sm">{l}</div>
              </div>
            ))}
          </div>
        </div>
        <div className="text-white/40 text-sm relative z-10">© 2024 PlaceNova</div>
      </div>

      {/* Right Panel */}
      <div className="flex-1 flex items-center justify-center p-6 bg-surface-50">
        <div className="w-full max-w-md animate-slide-up">
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-primary-600 flex items-center justify-center">
                <span className="text-white text-sm font-bold">PT</span>
              </div>
              <span className="font-bold text-slate-900">PlaceNova</span>
            </Link>
          </div>

          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Welcome back</h1>
          <p className="text-slate-500 mb-8">Sign in to continue to your dashboard</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="form-label">Email address</label>
              <input type="email" className="form-input" placeholder="you@example.com" required
                value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))} />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" className="form-input" placeholder="Your password" required
                value={form.password} onChange={e => setForm(p => ({ ...p, password: e.target.value }))} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full py-3 text-base">
              {loading ? (
                <span className="flex items-center gap-2"><span className="spinner w-4 h-4" /> Signing in...</span>
              ) : 'Sign In →'}
            </button>
          </form>

          {/* Demo accounts */}
          <div className="mt-6 p-4 rounded-xl bg-primary-50 border border-primary-100">
            <p className="text-xs font-bold text-primary-700 mb-2">🎓 Demo Accounts</p>
            <div className="space-y-1 text-xs text-primary-600">
              <p><strong>Student:</strong> student@demo.com / demo123</p>
              <p><strong>Coordinator:</strong> coordinator@demo.com / demo123</p>
            </div>
          </div>

          <p className="text-center text-slate-500 text-sm mt-6">
            Don't have an account?{' '}
            <Link to="/register" className="text-primary-600 font-semibold hover:text-primary-700">Sign up</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
