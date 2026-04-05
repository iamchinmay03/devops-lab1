import React, { useState } from 'react';
import useAuthStore from '../../context/authStore';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BRANCHES = ['CSE','IT','ECE','EEE','MECH','CIVIL','MBA','MCA','OTHER'];
const SKILLS_SUGGESTIONS = ['React','Node.js','Python','Java','C++','SQL','MongoDB','AWS','Docker','Machine Learning','Data Science','Angular','Vue.js','Spring Boot','DevOps'];

export default function StudentProfile() {
  const { user, updateUser } = useAuthStore();
  const sp = user?.studentProfile || {};
  const [saving, setSaving] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [form, setForm] = useState({
    name: user?.name || '',
    studentProfile: {
      rollNumber: sp.rollNumber || '',
      branch: sp.branch || 'CSE',
      year: sp.year || 3,
      cgpa: sp.cgpa || '',
      tenthPercentage: sp.tenthPercentage || '',
      twelfthPercentage: sp.twelfthPercentage || '',
      phone: sp.phone || '',
      linkedin: sp.linkedin || '',
      github: sp.github || '',
      skills: sp.skills || [],
      backlogs: sp.backlogs || 0,
    },
  });

  const setField = (field, val) => setForm(p => ({ ...p, [field]: val }));
  const setProfile = (field, val) => setForm(p => ({ ...p, studentProfile: { ...p.studentProfile, [field]: val } }));

  const addSkill = (skill) => {
    const s = skill.trim();
    if (s && !form.studentProfile.skills.includes(s)) {
      setProfile('skills', [...form.studentProfile.skills, s]);
    }
    setSkillInput('');
  };

  const removeSkill = (s) => setProfile('skills', form.studentProfile.skills.filter(x => x !== s));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const { data } = await api.put('/students/profile', form);
      updateUser(data.data);
      toast.success('Profile updated successfully!');
    } finally { setSaving(false); }
  };

  const placementStatus = sp.placementStatus || 'not_placed';
  const statusColors = { not_placed: 'badge-gray', placed: 'badge-green', in_process: 'badge-yellow', opted_out: 'badge-red' };

  return (
    <div className="space-y-6 animate-fade-in max-w-3xl">
      <div className="page-header">
        <h1 className="page-title">My Profile</h1>
        <p className="page-subtitle">Keep your profile updated to improve job matching</p>
      </div>

      {/* Profile Header */}
      <div className="glass-card p-6 flex items-center gap-5">
        <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary-500 to-violet-600 flex items-center justify-center text-3xl font-extrabold text-white flex-shrink-0">
          {user?.name?.charAt(0)}
        </div>
        <div className="flex-1">
          <h2 className="text-xl font-bold text-slate-900">{user?.name}</h2>
          <p className="text-slate-500 text-sm">{user?.email}</p>
          <div className="flex items-center gap-3 mt-2">
            <span className={statusColors[placementStatus]}>{placementStatus?.replace('_',' ')}</span>
            {sp.cgpa && <span className="badge-blue">CGPA: {sp.cgpa}</span>}
            {sp.branch && <span className="badge-purple">{sp.branch}</span>}
          </div>
        </div>
        {sp.placementStatus === 'placed' && (
          <div className="text-center">
            <div className="text-3xl">🎉</div>
            <div className="text-xs font-semibold text-accent-600 mt-1">Placed!</div>
            <div className="text-sm font-bold text-slate-900">{sp.placedPackage} LPA</div>
          </div>
        )}
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        {/* Basic Info */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">👤 Basic Information</h3>
          <div>
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.name} onChange={e => setField('name', e.target.value)} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Roll Number</label>
              <input className="form-input" value={form.studentProfile.rollNumber} onChange={e => setProfile('rollNumber', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Phone</label>
              <input className="form-input" value={form.studentProfile.phone} onChange={e => setProfile('phone', e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">Branch</label>
              <select className="form-select" value={form.studentProfile.branch} onChange={e => setProfile('branch', e.target.value)}>
                {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Year</label>
              <select className="form-select" value={form.studentProfile.year} onChange={e => setProfile('year', Number(e.target.value))}>
                {[1,2,3,4].map(y => <option key={y} value={y}>Year {y}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Backlogs</label>
              <input type="number" min="0" className="form-input" value={form.studentProfile.backlogs} onChange={e => setProfile('backlogs', Number(e.target.value))} />
            </div>
          </div>
        </div>

        {/* Academic */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">📚 Academic Details</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">CGPA (/ 10)</label>
              <input type="number" step="0.01" min="0" max="10" className="form-input" placeholder="8.50" value={form.studentProfile.cgpa} onChange={e => setProfile('cgpa', e.target.value)} />
            </div>
            <div>
              <label className="form-label">10th % </label>
              <input type="number" step="0.01" min="0" max="100" className="form-input" placeholder="90.5" value={form.studentProfile.tenthPercentage} onChange={e => setProfile('tenthPercentage', e.target.value)} />
            </div>
            <div>
              <label className="form-label">12th %</label>
              <input type="number" step="0.01" min="0" max="100" className="form-input" placeholder="88.0" value={form.studentProfile.twelfthPercentage} onChange={e => setProfile('twelfthPercentage', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Skills */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">🛠️ Skills</h3>
          <div className="flex gap-2 mb-3">
            <input className="form-input flex-1" placeholder="Add a skill..." value={skillInput}
              onChange={e => setSkillInput(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); addSkill(skillInput); } }} />
            <button type="button" onClick={() => addSkill(skillInput)} className="btn-primary px-4">Add</button>
          </div>
          <div className="flex flex-wrap gap-2 mb-3">
            {form.studentProfile.skills.map(s => (
              <span key={s} className="badge-blue gap-1 pr-1">
                {s}
                <button type="button" onClick={() => removeSkill(s)} className="ml-1 text-primary-400 hover:text-primary-700">×</button>
              </span>
            ))}
          </div>
          <div>
            <p className="text-xs text-slate-500 mb-2 font-medium">Suggestions:</p>
            <div className="flex flex-wrap gap-1.5">
              {SKILLS_SUGGESTIONS.filter(s => !form.studentProfile.skills.includes(s)).slice(0,8).map(s => (
                <button key={s} type="button" onClick={() => addSkill(s)} className="text-xs px-2.5 py-1 rounded-full border border-surface-200 text-slate-600 hover:bg-primary-50 hover:border-primary-300 hover:text-primary-700 transition-colors">
                  + {s}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Links */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2">🔗 Links</h3>
          <div>
            <label className="form-label">LinkedIn URL</label>
            <input className="form-input" placeholder="https://linkedin.com/in/yourprofile" value={form.studentProfile.linkedin} onChange={e => setProfile('linkedin', e.target.value)} />
          </div>
          <div>
            <label className="form-label">GitHub URL</label>
            <input className="form-input" placeholder="https://github.com/yourusername" value={form.studentProfile.github} onChange={e => setProfile('github', e.target.value)} />
          </div>
        </div>

        <button type="submit" disabled={saving} className="btn-primary w-full py-3 text-base">
          {saving ? <span className="flex items-center justify-center gap-2"><span className="spinner w-4 h-4" /> Saving...</span> : '💾 Save Profile'}
        </button>
      </form>
    </div>
  );
}
