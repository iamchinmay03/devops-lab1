import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BRANCHES = ['ALL','CSE','IT','ECE','EEE','MECH','CIVIL','MBA','MCA','OTHER'];
const INDUSTRIES = ['IT','Finance','Healthcare','Manufacturing','Consulting','E-Commerce','Telecom','Other'];
const ROLE_TYPES = ['Full-Time','Internship','Contract'];

const defaultRole = {
  title:'', type:'Full-Time', package:'', openings:1, description:'',
  eligibility:{ branches:['ALL'], minCGPA:0, maxBacklogs:0, tenthPercentage:0, twelfthPercentage:0 },
};

const defaultForm = {
  name:'', industry:'IT', description:'', website:'',
  location:{ city:'', state:'', country:'India' },
  roles:[{ ...defaultRole }],
  driveDate:'', registrationDeadline:'',
  hiringStatus:'upcoming',
  hrContact:{ name:'', email:'', phone:'' },
  selectionProcess:[
    { round:1, name:'Aptitude Test', description:'' },
    { round:2, name:'Technical Interview', description:'' },
    { round:3, name:'HR Interview', description:'' },
  ],
};

export default function CoordAddCompany() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;
  const [form, setForm] = useState(defaultForm);
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEdit);

  useEffect(() => {
    if (isEdit) {
      api.get(`/companies/${id}`).then(r => {
        const c = r.data.data;
        setForm({
          name: c.name, industry: c.industry, description: c.description || '',
          website: c.website || '', location: c.location || defaultForm.location,
          roles: c.roles?.length ? c.roles : defaultForm.roles,
          driveDate: c.driveDate ? c.driveDate.split('T')[0] : '',
          registrationDeadline: c.registrationDeadline ? c.registrationDeadline.split('T')[0] : '',
          hiringStatus: c.hiringStatus, hrContact: c.hrContact || defaultForm.hrContact,
          selectionProcess: c.selectionProcess?.length ? c.selectionProcess : defaultForm.selectionProcess,
        });
      }).finally(() => setLoading(false));
    }
  }, [id, isEdit]);

  const setField = (path, val) => {
    setForm(prev => {
      const copy = JSON.parse(JSON.stringify(prev));
      const parts = path.split('.');
      let cur = copy;
      for (let i = 0; i < parts.length - 1; i++) cur = cur[parts[i]];
      cur[parts[parts.length - 1]] = val;
      return copy;
    });
  };

  const addRole = () => setForm(p => ({ ...p, roles: [...p.roles, { ...defaultRole }] }));
  const removeRole = (i) => setForm(p => ({ ...p, roles: p.roles.filter((_, j) => j !== i) }));
  const setRole = (i, field, val) => {
    setForm(p => {
      const roles = [...p.roles];
      if (field.includes('.')) {
        const [parent, child] = field.split('.');
        roles[i] = { ...roles[i], [parent]: { ...roles[i][parent], [child]: val } };
      } else {
        roles[i] = { ...roles[i], [field]: val };
      }
      return { ...p, roles };
    });
  };

  const toggleBranch = (roleIdx, branch) => {
    const current = form.roles[roleIdx].eligibility.branches;
    let updated;
    if (branch === 'ALL') {
      updated = ['ALL'];
    } else {
      const without = current.filter(b => b !== 'ALL' && b !== branch);
      updated = current.includes(branch) ? without : [...without, branch];
      if (!updated.length) updated = ['ALL'];
    }
    setRole(roleIdx, 'eligibility.branches', updated);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit) {
        await api.put(`/companies/${id}`, form);
        toast.success('Company updated!');
      } else {
        await api.post('/companies', form);
        toast.success('Company added!');
      }
      navigate('/coordinator/companies');
    } finally { setSaving(false); }
  };

  if (loading) return <div className="flex justify-center py-20"><div className="spinner w-8 h-8" /></div>;

  return (
    <div className="max-w-3xl space-y-6 animate-fade-in">
      <div className="flex items-center gap-3 mb-2">
        <button onClick={() => navigate('/coordinator/companies')} className="btn-ghost p-2">←</button>
        <div className="page-header mb-0">
          <h1 className="page-title">{isEdit ? 'Edit Company' : 'Add New Company'}</h1>
          <p className="page-subtitle">Fill in company details for the placement drive</p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">🏢 Company Information</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="form-label">Company Name *</label>
              <input required className="form-input" placeholder="e.g. Google India" value={form.name} onChange={e => setField('name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Industry *</label>
              <select required className="form-select" value={form.industry} onChange={e => setField('industry', e.target.value)}>
                {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Hiring Status</label>
              <select className="form-select" value={form.hiringStatus} onChange={e => setField('hiringStatus', e.target.value)}>
                {['upcoming','open','in_progress','completed','cancelled'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
              </select>
            </div>
            <div>
              <label className="form-label">Website</label>
              <input className="form-input" placeholder="https://company.com" value={form.website} onChange={e => setField('website', e.target.value)} />
            </div>
            <div>
              <label className="form-label">City</label>
              <input className="form-input" placeholder="Bangalore" value={form.location.city} onChange={e => setField('location.city', e.target.value)} />
            </div>
            <div className="col-span-2">
              <label className="form-label">Description</label>
              <textarea className="form-input" rows="3" placeholder="Brief company description..." value={form.description} onChange={e => setField('description', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Drive Dates */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">📅 Drive Schedule</h3>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="form-label">Drive Date</label>
              <input type="date" className="form-input" value={form.driveDate} onChange={e => setField('driveDate', e.target.value)} />
            </div>
            <div>
              <label className="form-label">Registration Deadline</label>
              <input type="date" className="form-input" value={form.registrationDeadline} onChange={e => setField('registrationDeadline', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Roles */}
        <div className="glass-card p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-slate-900 flex items-center gap-2">💼 Job Roles</h3>
            <button type="button" onClick={addRole} className="btn-secondary text-sm">+ Add Role</button>
          </div>
          {form.roles.map((role, i) => (
            <div key={i} className="border border-surface-200 rounded-xl p-4 space-y-3 bg-surface-50/50">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-slate-700">Role {i + 1}</span>
                {form.roles.length > 1 && (
                  <button type="button" onClick={() => removeRole(i)} className="text-danger-500 text-xs hover:text-danger-700">Remove</button>
                )}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="form-label">Title *</label>
                  <input required className="form-input" placeholder="Software Engineer" value={role.title} onChange={e => setRole(i, 'title', e.target.value)} />
                </div>
                <div>
                  <label className="form-label">Type</label>
                  <select className="form-select" value={role.type} onChange={e => setRole(i, 'type', e.target.value)}>
                    {ROLE_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="form-label">Package (LPA) *</label>
                  <input required type="number" step="0.1" min="0" className="form-input" placeholder="8.5" value={role.package} onChange={e => setRole(i, 'package', e.target.value)} />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="form-label">Openings</label>
                  <input type="number" min="1" className="form-input" value={role.openings} onChange={e => setRole(i, 'openings', Number(e.target.value))} />
                </div>
                <div>
                  <label className="form-label">Min CGPA</label>
                  <input type="number" step="0.1" min="0" max="10" className="form-input" placeholder="6.0" value={role.eligibility.minCGPA} onChange={e => setRole(i, 'eligibility.minCGPA', Number(e.target.value))} />
                </div>
                <div>
                  <label className="form-label">Max Backlogs</label>
                  <input type="number" min="0" className="form-input" placeholder="0" value={role.eligibility.maxBacklogs} onChange={e => setRole(i, 'eligibility.maxBacklogs', Number(e.target.value))} />
                </div>
              </div>
              <div>
                <label className="form-label">Eligible Branches</label>
                <div className="flex flex-wrap gap-2">
                  {BRANCHES.map(b => (
                    <button key={b} type="button" onClick={() => toggleBranch(i, b)}
                      className={`text-xs px-3 py-1.5 rounded-full border font-medium transition-colors ${role.eligibility.branches.includes(b) ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-600 border-surface-200 hover:border-primary-300'}`}>
                      {b}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* HR Contact */}
        <div className="glass-card p-6 space-y-4">
          <h3 className="font-bold text-slate-900 flex items-center gap-2">👤 HR Contact</h3>
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="form-label">HR Name</label>
              <input className="form-input" placeholder="HR Manager Name" value={form.hrContact.name} onChange={e => setField('hrContact.name', e.target.value)} />
            </div>
            <div>
              <label className="form-label">HR Email</label>
              <input type="email" className="form-input" placeholder="hr@company.com" value={form.hrContact.email} onChange={e => setField('hrContact.email', e.target.value)} />
            </div>
            <div>
              <label className="form-label">HR Phone</label>
              <input className="form-input" placeholder="+91 9876543210" value={form.hrContact.phone} onChange={e => setField('hrContact.phone', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-4">
          <button type="button" onClick={() => navigate('/coordinator/companies')} className="btn-secondary flex-1 py-3">Cancel</button>
          <button type="submit" disabled={saving} className="btn-primary flex-1 py-3 text-base">
            {saving ? <span className="flex items-center justify-center gap-2"><span className="spinner w-4 h-4" /> Saving...</span>
              : isEdit ? '✏️ Update Company' : '🏢 Add Company'}
          </button>
        </div>
      </form>
    </div>
  );
}
