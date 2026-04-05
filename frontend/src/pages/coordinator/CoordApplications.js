import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const ALL_STATUSES = ['applied','shortlisted','aptitude_scheduled','aptitude_cleared','aptitude_failed','gd_scheduled','gd_cleared','gd_failed','interview_scheduled','interview_cleared','interview_failed','hr_scheduled','selected','rejected'];
const STATUS_COLORS = {
  applied:'badge-blue', shortlisted:'badge-yellow', selected:'badge-green',
  rejected:'badge-red', withdrawn:'badge-gray', interview_scheduled:'badge-purple',
  aptitude_scheduled:'badge-yellow', aptitude_cleared:'badge-green', aptitude_failed:'badge-red',
  hr_scheduled:'badge-purple',
};

export default function CoordApplications() {
  const [apps, setApps] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status:'', page:1 });
  const [updating, setUpdating] = useState(null);
  const [statusModal, setStatusModal] = useState(null);
  const [statusForm, setStatusForm] = useState({ status:'', note:'', package:'', joiningDate:'' });

  const fetchApps = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: filters.page, limit: 25 });
      if (filters.status) params.set('status', filters.status);
      const { data } = await api.get(`/applications?${params}`);
      setApps(data.data);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  };

  useEffect(() => { fetchApps(); }, [filters]);

  const openUpdate = (app) => {
    setStatusModal(app);
    setStatusForm({ status: app.status, note:'', package: app.package || '', joiningDate:'' });
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setUpdating(statusModal._id);
    try {
      await api.patch(`/applications/${statusModal._id}/status`, statusForm);
      toast.success('Application status updated!');
      setStatusModal(null);
      fetchApps();
    } finally { setUpdating(null); }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">Applications</h1>
        <p className="page-subtitle">{pagination.total || 0} total applications</p>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <select className="form-select w-52" value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value, page: 1 }))}>
          <option value="">All Statuses</option>
          {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
        </select>
        <div className="flex gap-2 ml-auto">
          <span className="badge-blue self-center">{apps.filter(a => a.status === 'applied').length} Applied</span>
          <span className="badge-yellow self-center">{apps.filter(a => a.status === 'shortlisted').length} Shortlisted</span>
          <span className="badge-green self-center">{apps.filter(a => a.status === 'selected').length} Selected</span>
        </div>
      </div>

      {/* Applications Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16"><div className="spinner w-8 h-8" /></div>
          ) : (
            <table className="data-table">
              <thead><tr>
                <th>Student</th><th>Company</th><th>Role</th><th>Applied</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {apps.map(app => {
                  const sc = STATUS_COLORS[app.status] || 'badge-gray';
                  return (
                    <tr key={app._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {app.student?.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{app.student?.name}</p>
                            <p className="text-xs text-slate-400">
                              {app.student?.studentProfile?.branch} • CGPA: {app.student?.studentProfile?.cgpa || 'N/A'}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">
                            {app.company?.name?.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-900 text-sm">{app.company?.name}</span>
                        </div>
                      </td>
                      <td className="text-slate-600 text-sm">{app.roleTitle}</td>
                      <td className="text-slate-400 text-sm">{format(new Date(app.appliedAt), 'dd MMM yyyy')}</td>
                      <td>
                        <span className={sc}>{app.status?.replace(/_/g,' ')}</span>
                        {app.package && <p className="text-xs text-accent-600 font-semibold mt-1">₹{app.package} LPA</p>}
                      </td>
                      <td>
                        {!['withdrawn'].includes(app.status) && (
                          <button onClick={() => openUpdate(app)} className="btn-secondary text-xs py-1.5 px-3">
                            Update
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!loading && !apps.length && (
            <div className="text-center py-16 text-slate-400">
              <div className="text-5xl mb-3">📋</div>
              <p className="font-medium">No applications found</p>
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

      {/* Status Update Modal */}
      {statusModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setStatusModal(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 text-lg mb-1">Update Application Status</h3>
            <div className="flex items-center gap-2 mb-5">
              <span className="badge-blue">{statusModal.student?.name}</span>
              <span className="text-slate-400">→</span>
              <span className="badge-purple">{statusModal.company?.name}</span>
            </div>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div>
                <label className="form-label">New Status</label>
                <select className="form-select" value={statusForm.status} onChange={e => setStatusForm(p => ({ ...p, status: e.target.value }))}>
                  {ALL_STATUSES.map(s => <option key={s} value={s}>{s.replace(/_/g,' ')}</option>)}
                </select>
              </div>
              <div>
                <label className="form-label">Note (optional)</label>
                <textarea className="form-input" rows="2" placeholder="Add a note for this status change..." value={statusForm.note} onChange={e => setStatusForm(p => ({ ...p, note: e.target.value }))} />
              </div>
              {statusForm.status === 'selected' && (<>
                <div>
                  <label className="form-label">Final Package (LPA)</label>
                  <input type="number" step="0.1" min="0" className="form-input" placeholder="e.g. 12.5" value={statusForm.package} onChange={e => setStatusForm(p => ({ ...p, package: e.target.value }))} />
                </div>
                <div>
                  <label className="form-label">Joining Date</label>
                  <input type="date" className="form-input" value={statusForm.joiningDate} onChange={e => setStatusForm(p => ({ ...p, joiningDate: e.target.value }))} />
                </div>
              </>)}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setStatusModal(null)} className="btn-secondary flex-1">Cancel</button>
                <button type="submit" disabled={!!updating} className="btn-primary flex-1">
                  {updating ? 'Updating...' : 'Update Status'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
