import React, { useEffect, useState, useCallback } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';

const BRANCHES = ['CSE','IT','ECE','EEE','MECH','CIVIL','MBA','MCA','OTHER'];
const PLACEMENT_STATUSES = ['not_placed','placed','in_process','opted_out'];
const STATUS_COLORS = { not_placed:'badge-gray', placed:'badge-green', in_process:'badge-yellow', opted_out:'badge-red' };

export default function CoordStudents() {
  const [students, setStudents] = useState([]);
  const [pagination, setPagination] = useState({});
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ search:'', branch:'', status:'', page: 1 });
  const [updating, setUpdating] = useState(null);
  const [selectedStudent, setSelectedStudent] = useState(null);
  const [statusForm, setStatusForm] = useState({ placementStatus:'', placedPackage:'' });

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: filters.page, limit: 20 });
      if (filters.search) params.set('search', filters.search);
      if (filters.branch) params.set('branch', filters.branch);
      if (filters.status) params.set('status', filters.status);
      const { data } = await api.get(`/students?${params}`);
      setStudents(data.data);
      setPagination(data.pagination);
    } finally { setLoading(false); }
  }, [filters]);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  const openStatusUpdate = (student) => {
    setSelectedStudent(student);
    setStatusForm({ placementStatus: student.studentProfile?.placementStatus || 'not_placed', placedPackage: student.studentProfile?.placedPackage || '' });
  };

  const handleStatusUpdate = async (e) => {
    e.preventDefault();
    setUpdating(selectedStudent._id);
    try {
      await api.patch(`/students/${selectedStudent._id}/status`, statusForm);
      toast.success('Student status updated!');
      setSelectedStudent(null);
      fetchStudents();
    } finally { setUpdating(null); }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Deactivate ${name}?`)) return;
    await api.delete(`/students/${id}`);
    toast.success('Student deactivated');
    fetchStudents();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header flex items-center justify-between">
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{pagination.total || 0} registered students</p>
        </div>
      </div>

      {/* Filters */}
      <div className="glass-card p-4 flex flex-wrap gap-3">
        <input className="form-input flex-1 min-w-48" placeholder="🔍 Search by name, email, roll no..."
          value={filters.search} onChange={e => setFilters(p => ({ ...p, search: e.target.value, page: 1 }))}
          onKeyDown={e => e.key === 'Enter' && fetchStudents()} />
        <select className="form-select w-36" value={filters.branch} onChange={e => setFilters(p => ({ ...p, branch: e.target.value, page: 1 }))}>
          <option value="">All Branches</option>
          {BRANCHES.map(b => <option key={b} value={b}>{b}</option>)}
        </select>
        <select className="form-select w-40" value={filters.status} onChange={e => setFilters(p => ({ ...p, status: e.target.value, page: 1 }))}>
          <option value="">All Status</option>
          {PLACEMENT_STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
        </select>
        <button onClick={() => fetchStudents()} className="btn-primary">Search</button>
      </div>

      {/* Table */}
      <div className="glass-card overflow-hidden">
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-16"><div className="spinner w-8 h-8" /></div>
          ) : (
            <table className="data-table">
              <thead><tr>
                <th>Student</th><th>Branch</th><th>CGPA</th><th>Skills</th><th>Status</th><th>Actions</th>
              </tr></thead>
              <tbody>
                {students.map(s => {
                  const sc = STATUS_COLORS[s.studentProfile?.placementStatus] || 'badge-gray';
                  return (
                    <tr key={s._id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-primary-400 to-violet-500 flex items-center justify-center text-white text-sm font-bold flex-shrink-0">
                            {s.name?.charAt(0)}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-900 text-sm">{s.name}</p>
                            <p className="text-slate-400 text-xs">{s.email}</p>
                            {s.studentProfile?.rollNumber && <p className="text-slate-400 text-xs">{s.studentProfile.rollNumber}</p>}
                          </div>
                        </div>
                      </td>
                      <td>
                        <span className="badge-purple">{s.studentProfile?.branch}</span>
                        <p className="text-xs text-slate-400 mt-1">Year {s.studentProfile?.year}</p>
                      </td>
                      <td>
                        <span className={`font-bold ${s.studentProfile?.cgpa >= 8 ? 'text-accent-600' : s.studentProfile?.cgpa >= 6 ? 'text-amber-600' : 'text-danger-500'}`}>
                          {s.studentProfile?.cgpa || '—'}
                        </span>
                        {s.studentProfile?.backlogs > 0 && <p className="text-xs text-danger-500">{s.studentProfile.backlogs} backlogs</p>}
                      </td>
                      <td>
                        <div className="flex flex-wrap gap-1 max-w-32">
                          {s.studentProfile?.skills?.slice(0, 3).map(skill => (
                            <span key={skill} className="badge-blue text-xs">{skill}</span>
                          ))}
                          {(s.studentProfile?.skills?.length || 0) > 3 && (
                            <span className="badge-gray text-xs">+{s.studentProfile.skills.length - 3}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        <span className={sc}>{s.studentProfile?.placementStatus?.replace('_',' ') || 'not placed'}</span>
                        {s.studentProfile?.placedPackage && (
                          <p className="text-xs text-accent-600 font-semibold mt-1">₹{s.studentProfile.placedPackage} LPA</p>
                        )}
                      </td>
                      <td>
                        <div className="flex gap-2">
                          <button onClick={() => openStatusUpdate(s)} className="btn-secondary text-xs py-1.5 px-3">
                            Update Status
                          </button>
                          <button onClick={() => handleDelete(s._id, s.name)} className="btn-ghost text-danger-500 text-xs py-1.5">
                            Remove
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
          {!loading && !students.length && (
            <div className="text-center py-16 text-slate-400">
              <div className="text-5xl mb-3">🎓</div>
              <p className="font-medium">No students found</p>
            </div>
          )}
        </div>

        {/* Pagination */}
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
      {selectedStudent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm" onClick={() => setSelectedStudent(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md animate-slide-up p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-bold text-slate-900 text-lg mb-1">Update Placement Status</h3>
            <p className="text-slate-500 text-sm mb-5">{selectedStudent.name} · {selectedStudent.studentProfile?.branch}</p>
            <form onSubmit={handleStatusUpdate} className="space-y-4">
              <div>
                <label className="form-label">Placement Status</label>
                <select className="form-select" value={statusForm.placementStatus} onChange={e => setStatusForm(p => ({ ...p, placementStatus: e.target.value }))}>
                  {PLACEMENT_STATUSES.map(s => <option key={s} value={s}>{s.replace('_',' ')}</option>)}
                </select>
              </div>
              {statusForm.placementStatus === 'placed' && (
                <div>
                  <label className="form-label">Package (LPA)</label>
                  <input type="number" step="0.1" min="0" className="form-input" placeholder="e.g. 8.5" value={statusForm.placedPackage} onChange={e => setStatusForm(p => ({ ...p, placedPackage: e.target.value }))} />
                </div>
              )}
              <div className="flex gap-3 pt-2">
                <button type="button" onClick={() => setSelectedStudent(null)} className="btn-secondary flex-1">Cancel</button>
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
