import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_COLORS = { upcoming:'badge-yellow', open:'badge-green', in_progress:'badge-blue', completed:'badge-gray', cancelled:'badge-red' };
const STATUSES = ['upcoming','open','in_progress','completed','cancelled'];

export default function CoordCompanies() {
  const [companies, setCompanies] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status:'', industry:'', page: 1 });
  const [deleting, setDeleting] = useState(null);

  const fetchCompanies = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: filters.page });
      if (filters.status) params.set('status', filters.status);
      if (filters.industry) params.set('industry', filters.industry);
      const { data } = await api.get(`/companies?${params}`);
      setCompanies(data.data);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchCompanies(); }, [filters.status, filters.industry, filters.page]);

  const handleStatusChange = async (id, status) => {
    await api.put(`/companies/${id}`, { hiringStatus: status });
    toast.success('Status updated');
    fetchCompanies();
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Remove ${name}?`)) return;
    setDeleting(id);
    try {
      await api.delete(`/companies/${id}`);
      toast.success('Company removed');
      fetchCompanies();
    } finally { setDeleting(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div className="page-header mb-0">
          <h1 className="page-title">Companies</h1>
          <p className="page-subtitle">{pagination.total || 0} companies registered</p>
        </div>
        <Link to="/coordinator/companies/add" className="btn-primary">+ Add Company</Link>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <select className="form-select w-44" value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <select className="form-select w-44" value={filters.industry} onChange={e => setFilters(p => ({ ...p, industry: e.target.value, page: 1 }))}>
          <option value="">All Industries</option>
          {['IT','Finance','Healthcare','Manufacturing','Consulting','E-Commerce','Telecom','Other'].map(i => <option key={i} value={i}>{i}</option>)}
        </select>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16"><div className="spinner w-8 h-8" /></div>
          ) : (
            <table className="data-table">
              <thead><tr>
                <th>Company</th><th>Industry</th><th>Roles / Package</th><th>Drive Date</th><th>Status</th><th>Hired</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {companies.map(c => (
                  <tr key={c._id}>
                    <td>
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-lg font-bold text-primary-700 flex-shrink-0">
                          {c.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-sm">{c.name}</p>
                          {c.location?.city && <p className="text-xs text-slate-400">📍 {c.location.city}</p>}
                        </div>
                      </div>
                    </td>
                    <td><span className="badge-blue">{c.industry}</span></td>
                    <td>
                      {c.roles?.slice(0, 2).map((r, i) => (
                        <p key={i} className="text-xs text-slate-700">
                          <span className="font-semibold">{r.title}</span>
                          <span className="text-accent-600 ml-1">₹{r.package} LPA</span>
                        </p>
                      ))}
                      {c.roles?.length > 2 && <p className="text-xs text-slate-400">+{c.roles.length - 2} more</p>}
                    </td>
                    <td className="text-slate-500 text-sm">
                      {c.driveDate ? format(new Date(c.driveDate), 'dd MMM yyyy') : '—'}
                    </td>
                    <td>
                      <select
                        value={c.hiringStatus}
                        onChange={e => handleStatusChange(c._id, e.target.value)}
                        className="text-xs px-2 py-1.5 rounded-lg border border-surface-200 bg-white font-medium text-slate-700 cursor-pointer hover:border-primary-300 transition-colors"
                      >
                        {STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                      </select>
                    </td>
                    <td>
                      <span className={c.totalHired > 0 ? 'badge-green' : 'badge-gray'}>{c.totalHired}</span>
                    </td>
                    <td>
                      <div className="flex gap-1.5">
                        <Link to={`/coordinator/companies/edit/${c._id}`} className="btn-secondary text-xs py-1.5 px-3">Edit</Link>
                        <button onClick={() => handleDelete(c._id, c.name)} disabled={deleting === c._id} className="btn-ghost text-danger-500 text-xs py-1.5 px-2">
                          {deleting === c._id ? '...' : 'Del'}
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {!loading && !companies.length && (
            <div className="text-center py-16 text-slate-400">
              <div className="text-5xl mb-3">🏢</div>
              <p className="font-medium mb-4">No companies yet</p>
              <Link to="/coordinator/companies/add" className="btn-primary text-sm">Add First Company</Link>
            </div>
          )}
        </div>
        {pagination.pages > 1 && (
          <div className="p-4 border-t border-surface-100 flex items-center justify-between">
            <p className="text-sm text-slate-500">Page {pagination.page} of {pagination.pages}</p>
            <div className="flex gap-2">
              <button disabled={filters.page <= 1} onClick={() => setFilters(p => ({ ...p, page: p.page - 1 }))} className="btn-secondary text-sm disabled:opacity-40">← Prev</button>
              <button disabled={filters.page >= pagination.pages} onClick={() => setFilters(p => ({ ...p, page: p.page + 1 }))} className="btn-secondary text-sm disabled:opacity-40">Next →</button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
