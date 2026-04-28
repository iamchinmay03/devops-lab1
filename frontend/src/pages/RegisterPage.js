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
    <div className="min-h-screen flex items-center justify-center p-6" style={{ 
      background: 'linear-gradient(135deg, #f8faff 0%, #f0f5ff 50%, #faf5ff 100%)' 
    }}>
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-3 mb-6">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-blue-600 to-violet-600 flex items-center justify-center shadow-lg shadow-blue-600/25">
              <svg viewBox="0 0 40 40" className="w-7 h-7" fill="none">
                <rect width="40" height="40" rx="10" fill="url(#regLogoGrad)"/>
                <path d="M12 28L20 12L28 28H12Z" fill="white" opacity="0.9"/>
                <circle cx="20" cy="22" r="3" fill="white"/>
                <defs>
                  <linearGradient id="regLogoGrad" x1="0" y1="0" x2="40" y2="40">
                    <stop stopColor="#2563eb"/>
                    <stop offset="1" stopColor="#7c3aed"/>
                  </linearGradient>
                </defs>
              </svg>
            </div>
            <span className="font-display font-bold text-2xl text-slate-900">PlaceNova</span>
          </Link>
          <h1 className="text-3xl font-display font-bold text-slate-900 mb-2">Create your account</h1>
          <p className="text-slate-500">Step {step} of 2 — {step === 1 ? 'Basic Info' : 'Profile Details'}</p>
        </div>

        {/* Progress Bar */}
        <div className="flex gap-2 mb-8">
          {[1, 2].map(i => (
            <div key={i} className="flex-1 h-1.5 rounded-full overflow-hidden bg-slate-200">
              <div className="h-full rounded-full transition-all duration-500" 
                style={{ 
                  width: step >= i ? '100%' : '0%',
                  background: step >= i ? 'linear-gradient(90deg, #2563eb, #7c3aed)' : 'transparent'
                }} 
              />
            </div>
          ))}
        </div>

        {/* Role Toggle */}
        {step === 1 && (
          <div className="flex p-1.5 rounded-2xl mb-6" style={{ background: 'rgba(226, 232, 240, 0.5)', border: '1px solid #e2e8f0' }}>
            {['student','coordinator'].map(r => (
              <button key={r} type="button" onClick={() => set('role', r)}
                className={`flex-1 py-3 rounded-xl text-sm font-semibold capitalize transition-all duration-300 ${
                  form.role === r 
                    ? 'bg-white text-blue-600 shadow-md border border-blue-100' 
                    : 'text-slate-500 hover:text-slate-700'
                }`}>
                {r === 'student' ? '🎓 Student' : '👨‍💼 Coordinator'}
              </button>
            ))}
          </div>
        )}

        <div className="card p-8" style={{ boxShadow: '0 8px 40px rgba(0,0,0,0.08)' }}>
          {step === 1 ? (
            <form onSubmit={handleStep1} className="space-y-5">
              {error && (
                <div className="p-4 rounded-xl bg-red-50 text-red-600 text-sm font-medium border border-red-100" 
                     style={{ background: 'linear-gradient(135deg, #fef2f2, #fee2e2)' }}>
                  ⚠️ {error}
                </div>
              )}
              <div>
                <label className="form-label">Full Name</label>
                <input className="form-input" placeholder="Rahul Sharma" required 
                  value={form.name} onChange={e => set('name', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Email Address</label>
                <input type="email" className="form-input" placeholder="you@college.edu" required 
                  value={form.email} onChange={e => set('email', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Password</label>
                <input type="password" className="form-input" placeholder="Min 6 characters" required 
                  value={form.password} onChange={e => set('password', e.target.value)} />
              </div>
              <div>
                <label className="form-label">Confirm Password</label>
                <input type="password" className="form-input" placeholder="Re-enter password" required 
                  value={form.confirmPassword} onChange={e => set('confirmPassword', e.target.value)} />
              </div>

              <button type="submit" className="btn-primary w-full py-4 text-base mt-2">
                Continue → 
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {form.role === 'student' ? (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Roll Number</label>
                      <input className="form-input" placeholder="RA2111003" 
                        value={form.studentProfile.rollNumber} onChange={e => setStudent('rollNumber', e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Branch</label>
                      <select className="form-select" value={form.studentProfile.branch} 
                        onChange={e => setStudent('branch', e.target.value)}>
                        {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
                      </select>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Year</label>
                      <select className="form-select" value={form.studentProfile.year} 
                        onChange={e => setStudent('year', parseInt(e.target.value))}>
                        {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="form-label">CGPA</label>
                      <input type="number" step="0.01" className="form-input" placeholder="8.5" 
                        value={form.studentProfile.cgpa} onChange={e => setStudent('cgpa', e.target.value)} />
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" placeholder="+91 98765 43210" 
                      value={form.studentProfile.phone} onChange={e => setStudent('phone', e.target.value)} />
                  </div>
                </>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="form-label">Employee ID</label>
                      <input className="form-input" placeholder="EMP001" 
                        value={form.coordinatorProfile.employeeId} onChange={e => setCoord('employeeId', e.target.value)} />
                    </div>
                    <div>
                      <label className="form-label">Department</label>
                      <select className="form-select" value={form.coordinatorProfile.department} 
                        onChange={e => setCoord('department', e.target.value)}>
                        <option value="">Select Department</option>
                        <option value="CSE">Computer Science</option>
                        <option value="IT">Information Technology</option>
                        <option value="ECE">Electronics</option>
                        <option value="EEE">Electrical</option>
                        <option value="MECH">Mechanical</option>
                        <option value="CIVIL">Civil</option>
                        <option value="MBA">Management</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="form-label">Phone Number</label>
                    <input className="form-input" placeholder="+91 98765 43210" 
                      value={form.coordinatorProfile.phone} onChange={e => setCoord('phone', e.target.value)} />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStep(1)} className="btn-secondary flex-1">
                  ← Back
                </button>
                <button type="submit" disabled={loading} className="btn-primary flex-1 py-4">
                  {loading ? <span className="flex items-center gap-2"><span className="spinner w-5 h-5" /> Creating...</span> : 'Create Account →'}
                </button>
              </div>
            </form>
          )}
        </div>

        <p className="text-center text-slate-500 text-sm mt-6">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-blue-600 hover:text-blue-700">Sign in</Link>
        </p>
      </div>
    </div>
  );
}
