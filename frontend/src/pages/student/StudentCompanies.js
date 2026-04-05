import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_COLORS = { upcoming:'badge-yellow', open:'badge-green', in_progress:'badge-blue', completed:'badge-gray', cancelled:'badge-red' };
const INDUSTRIES = ['IT','Finance','Healthcare','Manufacturing','Consulting','E-Commerce','Telecom','Other'];

export default function StudentCompanies() {
  const [companies, setCompanies] = useState([]);
  const [appliedIds, setAppliedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(null);
  const [selected, setSelected] = useState(null);
  const [filters, setFilters] = useState({ status: '', industry: '', search: '' });

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.status) params.set('status', filters.status);
      if (filters.industry) params.set('industry', filters.industry);
      if (filters.search) params.set('search', filters.search);
      const [compRes, appRes] = await Promise.all([
        api.get(`/companies?${params}`),
        api.get('/applications/my'),
      ]);
      setCompanies(compRes.data.data);
      setAppliedIds(appRes.data.data.map(a => a.company._id));
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCompanies(); }, [filters.status, filters.industry]);

  const handleApply = async (company, role) => {
    setApplying(company._id);
    try {
      await api.post('/applications', { companyId: company._id, roleTitle: role.title });
      toast.success(`Applied to ${company.name}!`);
      setAppliedIds(p => [...p, company._id]);
      setSelected(null);
    } finally { setApplying(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Companies</h1>
        <p className="page-subtitle">Explore and apply to placement drives</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <input className="form-input flex-1 min-w-48" placeholder="🔍 Search companies..." value={filters.search}
          onChange={e => setFilters(p => ({ ...p, search: e.target.value }))}
          onKeyDown={e => e.key === 'Enter' && fetchCompanies()} />
        <select className="form-select w-40" value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value }))}>
          <option value="">All Status</option>
          {['upcoming','open','in_progress','completed'].map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select className="form-select w-40" value={filters.industry} onChange={e => setFilters(p => ({ ...p, industry: e.target.value }))}>
          <option value="">All Industries</option>
          {INDUSTRIES.map(i => <option key={i} value={i}>{i}</option>)}
        </select>
        <button onClick={fetchCompanies} className="btn-primary">Search</button>
      </div>

      {/* Company Grid */}
      {loading ? (
        <div className="flex justify-center py-16"><div className="spinner w-8 h-8" /></div>
      ) : (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {companies.map(c => {
            const applied = appliedIds.includes(c._id);
            const isOpen = ['open','upcoming'].includes(c.hiringStatus);
            return (
              <div key={c._id} className="glass-card p-5 flex flex-col gap-4 hover:shadow-card-hover transition-all duration-300 hover:-translate-y-0.5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-xl font-bold text-primary-700">
                      {c.name.charAt(0)}
                    </div>
                    <div>
                      <h3 className="font-bold text-slate-900 text-sm">{c.name}</h3>
                      <p className="text-xs text-slate-500">{c.industry}</p>
                    </div>
                  </div>
                  <span className={STATUS_COLORS[c.hiringStatus] || 'badge-gray'}>{c.hiringStatus?.replace('_',' ')}</span>
                </div>

                {/* Roles */}
                <div className="space-y-2">
                  {c.roles?.slice(0, 2).map((r, i) => (
                    <div key={i} className="flex items-center justify-between p-2.5 rounded-lg bg-surface-50">
                      <div>
                        <p className="text-xs font-semibold text-slate-900">{r.title}</p>
                        <p className="text-xs text-slate-500">{r.type} • {r.eligibility?.branches?.join(', ')}</p>
                      </div>
                      <span className="text-xs font-bold text-accent-600">₹{r.package} LPA</span>
                    </div>
                  ))}
                </div>

                {/* Meta */}
                <div className="flex items-center gap-3 text-xs text-slate-400">
                  {c.driveDate && <span>📅 {format(new Date(c.driveDate), 'dd MMM yyyy')}</span>}
                  {c.location?.city && <span>📍 {c.location.city}</span>}
                </div>

                <div className="flex gap-2 mt-auto">
                  <button onClick={() => setSelected(c)} className="btn-secondary flex-1 text-xs py-2">View Details</button>
                  {applied ? (
                    <span className="flex-1 text-center text-xs font-semibold text-accent-600 bg-accent-50 rounded-xl py-2">✓ Applied</span>
                  ) : (
                    <button onClick={() => setSelected(c)} disabled={!isOpen} className="btn-primary flex-1 text-xs py-2 disabled:opacity-40">Apply Now</button>
                  )}
                </div>
              </div>
            );
          })}
          {!companies.length && (
            <div className="col-span-3 text-center py-16 text-slate-400">
              <div className="text-6xl mb-4">🏢</div>
              <p className="font-medium">No companies found</p>
            </div>
          )}
        </div>
      )}

      {/* Company Detail Modal */}
      {selected && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelected(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-slide-up" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b border-surface-100 flex items-start justify-between">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-2xl font-bold text-primary-700">
                  {selected.name.charAt(0)}
                </div>
                <div>
                  <h2 className="text-xl font-bold text-slate-900">{selected.name}</h2>
                  <p className="text-slate-500 text-sm">{selected.industry} • {selected.location?.city}</p>
                </div>
              </div>
              <button onClick={() => setSelected(null)} className="btn-ghost p-2">✕</button>
            </div>
            <div className="p-6 space-y-5">
              {selected.description && <p className="text-sm text-slate-600 leading-relaxed">{selected.description}</p>}

              <div>
                <h4 className="font-bold text-slate-900 mb-3">Available Roles</h4>
                <div className="space-y-3">
                  {selected.roles?.map((r, i) => (
                    <div key={i} className="border border-surface-200 rounded-xl p-4">
                      <div className="flex items-center justify-between mb-2">
                        <h5 className="font-semibold text-slate-900">{r.title}</h5>
                        <span className="font-bold text-accent-600">₹{r.package} LPA</span>
                      </div>
                      <div className="flex flex-wrap gap-2 text-xs text-slate-500 mb-3">
                        <span>Type: {r.type}</span>
                        <span>• Openings: {r.openings}</span>
                        <span>• Min CGPA: {r.eligibility?.minCGPA}</span>
                        <span>• Max Backlogs: {r.eligibility?.maxBacklogs}</span>
                      </div>
                      <div className="flex flex-wrap gap-1.5 mb-3">
                        {r.eligibility?.branches?.map(b => <span key={b} className="badge-blue">{b}</span>)}
                      </div>
                      {!appliedIds.includes(selected._id) && ['open','upcoming'].includes(selected.hiringStatus) && (
                        <button onClick={() => handleApply(selected, r)} disabled={applying === selected._id} className="btn-primary text-xs py-2">
                          {applying === selected._id ? '...' : `Apply for ${r.title}`}
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {selected.selectionProcess?.length > 0 && (
                <div>
                  <h4 className="font-bold text-slate-900 mb-3">Selection Process</h4>
                  <div className="flex gap-3 overflow-x-auto pb-2">
                    {selected.selectionProcess.map((s, i) => (
                      <div key={i} className="flex-shrink-0 p-3 bg-surface-50 rounded-xl text-center min-w-24">
                        <div className="w-7 h-7 rounded-full bg-primary-600 text-white text-xs font-bold flex items-center justify-center mx-auto mb-2">{i+1}</div>
                        <p className="text-xs font-semibold text-slate-900">{s.name}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
