import React, { useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import useAuthStore from '../context/authStore';

const BRANCHES = ['CSE','IT','ECE','EEE','MECH','CIVIL','MBA','MCA','OTHER'];

export default function RegisterPage() {
  const [params] = useSearchParams();
  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    role: params.get('role') || 'student',
    studentProfile: { rollNumber: '', branch: 'CSE', year: 3, cgpa: '', phone: '' },
    coordinatorProfile: { employeeId: '', department: '', phone: '' },
  });
  const [error, setError] = useState('');
  const { register, loading } = useAuthStore();
  const navigate = useNavigate();

  const set = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const setStudent = (field, val) => setForm(p => ({ ...p, studentProfile: { ...p.studentProfile, [field]: val } }));
  const setCoord = (field, val) => setForm(p => ({ ...p, coordinatorProfile: { ...p.coordinatorProfile, [field]: val } }));

  const handleStep1 = (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) { setError('Passwords do not match'); return; }
    if (form.password.length < 6) { setError('Password must be at least 6 characters'); return; }
    setError(''); setStep(2);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = { name: form.name, email: form.email, password: form.password, role: form.role };
    if (form.role === 'student') payload.studentProfile = form.studentProfile;
    if (form.role === 'coordinator') payload.coordinatorProfile = form.coordinatorProfile;
    const result = await register(payload);
    if (result.success) navigate(result.role === 'student' ? '/student/dashboard' : '/coordinator/dashboard');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-surface-50 p-6">
      <div className="w-full max-w-lg animate-slide-up">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2 mb-6">
            <div className="w-9 h-9 rounded-xl bg-primary-600 flex items-center justify-center">
              <span className="text-white font-bold">PT</span>
            </div>
            <span className="font-bold text-xl text-slate-900">PlaceNova</span>
          </Link>
          <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Create your account</h1>
          <p className="text-slate-500">Step {step} of 2 — {step === 1 ? 'Basic Info' : 'Profile Details'}</p>
        </div>

        {/* Role Toggle */}
        {step === 1 && (
          <div className="flex bg-surface-100 rounded-xl p-1 mb-6">
            {['student','coordinator'].map(r => (
              <button key={r} type="button" onClick={() => set('role', r)}
                className={`flex-1 py-2.5 rounded-lg text-sm font-semibold capitalize transition-all ${form.role === r ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>
                {r === 'student' ? '🎓 Student' : '👨‍💼 Coordinator'}
              </button>
            ))}
          </div>
        )}

        <div className="glass-card p-8">
          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-4">
              {error && <div className="p-3 rounded-xl bg-danger-500/10 text-danger-600 text-sm font-medium">{error}</div>}
              <div>
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Rahul Sharma" required value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Email</label>
                <input type="email" className="form-input" placeholder="you@college.edu" required value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Password</label>
                <input type="password" className="form-input" placeholder="Min 6 characters" required value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-input" placeholder="Repeat password" required value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
              </div>
              <button type="submit" className="btn-primary w-full py-3">Continue →</button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {form.role === 'student' ? (<>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Roll Number</label>
                    <input className="form-input" placeholder="21CSE001" value={form.studentProfile.rollNumber} onChange={e => setStudent('rollNumber', e.target.value)} />
                  </div>
                  <div>
                    <label className="form-label">Branch</label>
                    <select className="form-select" value={form.studentProfile.branch} onChange={e => setStudent('branch', e.target.value)}>
                      {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="form-label">Year</label>
                    <select className="form-select" value={form.studentProfile.year} onChange={e => setStudent('year', Number(e.target.value))}>
                      {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="form-label">CGPA</label>
                    <input type="number" step="0.01" min="0" max="10" className="form-input" placeholder="8.50" value={form.studentProfile.cgpa} onChange={e => setStudent('cgpa', e.target.value)} />
                  </div>
                </div>
                <div>
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" placeholder="+91 9876543210" value={form.studentProfile.phone} onChange={e => setStudent('phone', e.target.value)} />
                </div>
              </>) : (<>
                <div>
                  <label className="form-label">Employee ID</label>
                  <input className="form-input" placeholder="EMP001" value={form.coordinatorProfile.employeeId} onChange={e => setCoord('employeeId', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Department</label>
                  <input className="form-input" placeholder="Training & Placement Cell" value={form.coordinatorProfile.department} onChange={e => setCoord('department', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Phone Number</label>
                  <input className="form-input" placeholder="+91 9876543210" value={form.coordinatorProfile.phone} onChange={e => setCoord('phone', e.target.value)} />
                </div>
              </>)}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1 py-3">← Back</button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-3">
                  {loading ? <span className="flex items-center justify-center gap-2"><span className="spinner w-4 h-4" /> Creating...</span> : 'Create Account 🎉'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account? <Link to="/login" className="text-primary-600 font-semibold hover:text-primary-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
