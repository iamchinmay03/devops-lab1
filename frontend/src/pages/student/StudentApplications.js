import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import toast from 'react-hot-toast';
import { format } from 'date-fns';

const STATUS_CONFIG = {
  applied:              { label: 'Applied',              color: 'badge-blue',   icon: '📤' },
  shortlisted:          { label: 'Shortlisted',          color: 'badge-yellow', icon: '⭐' },
  aptitude_scheduled:   { label: 'Aptitude Scheduled',   color: 'badge-yellow', icon: '📝' },
  aptitude_cleared:     { label: 'Aptitude Cleared',     color: 'badge-green',  icon: '✅' },
  aptitude_failed:      { label: 'Aptitude Failed',      color: 'badge-red',    icon: '❌' },
  gd_scheduled:         { label: 'GD Scheduled',         color: 'badge-yellow', icon: '🗣️' },
  gd_cleared:           { label: 'GD Cleared',           color: 'badge-green',  icon: '✅' },
  gd_failed:            { label: 'GD Failed',            color: 'badge-red',    icon: '❌' },
  interview_scheduled:  { label: 'Interview Scheduled',  color: 'badge-purple', icon: '🎤' },
  interview_cleared:    { label: 'Interview Cleared',    color: 'badge-green',  icon: '✅' },
  interview_failed:     { label: 'Interview Failed',     color: 'badge-red',    icon: '❌' },
  hr_scheduled:         { label: 'HR Round',             color: 'badge-purple', icon: '👔' },
  selected:             { label: 'Selected 🎉',          color: 'badge-green',  icon: '🎉' },
  rejected:             { label: 'Rejected',             color: 'badge-red',    icon: '❌' },
  withdrawn:            { label: 'Withdrawn',            color: 'badge-gray',   icon: '↩️' },
};

export default function StudentApplications() {
  const [apps, setApps] = useState([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(null);
  const [withdrawing, setWithdrawing] = useState(null);

  useEffect(() => {
    api.get('/applications/my').then(r => setApps(r.data.data)).finally(() => setLoading(false));
  }, []);

  const handleWithdraw = async (id) => {
    if (!window.confirm('Withdraw this application?')) return;
    setWithdrawing(id);
    try {
      await api.patch(`/applications/${id}/withdraw`);
      setApps(p => p.map(a => a._id === id ? { ...a, status: 'withdrawn' } : a));
      toast.success('Application withdrawn');
    } finally { setWithdrawing(null); }
  };

  if (loading) return <div className="flex justify-center py-16"><div className="spinner w-8 h-8" /></div>;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="page-header">
        <h1 className="page-title">My Applications</h1>
        <p className="page-subtitle">{apps.length} total applications</p>
      </div>

      {apps.length === 0 ? (
        <div className="glass-card p-16 text-center">
          <div className="text-6xl mb-4">📋</div>
          <h3 className="font-bold text-slate-900 mb-2">No applications yet</h3>
          <p className="text-slate-500 text-sm mb-6">Start applying to companies to track your progress here</p>
          <a href="/student/companies" className="btn-primary">Browse Companies</a>
        </div>
      ) : (
        <div className="space-y-4">
          {apps.map(app => {
            const s = STATUS_CONFIG[app.status] || { label: app.status, color: 'badge-gray', icon: '❓' };
            const isExpanded = expanded === app._id;
            const canWithdraw = !['selected','rejected','withdrawn'].includes(app.status);

            return (
              <div key={app._id} className="glass-card overflow-hidden">
                <div className="p-5 flex items-center gap-4 cursor-pointer" onClick={() => setExpanded(isExpanded ? null : app._id)}>
                  <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-100 to-primary-200 flex items-center justify-center text-xl font-bold text-primary-700 flex-shrink-0">
                    {app.company?.name?.charAt(0)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-1">
                      <h3 className="font-bold text-slate-900 truncate">{app.company?.name}</h3>
                      <span className={s.color}>{s.icon} {s.label}</span>
                    </div>
                    <p className="text-sm text-slate-500">{app.roleTitle} • Applied {format(new Date(app.appliedAt), 'dd MMM yyyy')}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    {canWithdraw && (
                      <button onClick={e => { e.stopPropagation(); handleWithdraw(app._id); }}
                        disabled={withdrawing === app._id}
                        className="btn-ghost text-danger-500 hover:bg-danger-50 text-xs py-1.5 px-3">
                        {withdrawing === app._id ? '...' : 'Withdraw'}
                      </button>
                    )}
                    <span className="text-slate-400 text-lg">{isExpanded ? '▲' : '▼'}</span>
                  </div>
                </div>

                {isExpanded && (
                  <div className="border-t border-surface-100 p-5">
                    {/* Package info if selected */}
                    {app.status === 'selected' && app.package && (
                      <div className="mb-4 p-4 rounded-xl bg-accent-50 border border-accent-200 flex items-center gap-3">
                        <span className="text-2xl">🎊</span>
                        <div>
                          <p className="font-bold text-accent-700">Offer Details</p>
                          <p className="text-sm text-accent-600">Package: ₹{app.package} LPA{app.joiningDate ? ` • Joining: ${format(new Date(app.joiningDate), 'dd MMM yyyy')}` : ''}</p>
                        </div>
                      </div>
                    )}

                    {/* Timeline */}
                    <h4 className="font-bold text-slate-900 mb-4 text-sm">Application Timeline</h4>
                    <div className="relative pl-6 space-y-4">
                      <div className="absolute left-2 top-2 bottom-2 w-0.5 bg-surface-200" />
                      {app.timeline?.map((t, i) => {
                        const ts = STATUS_CONFIG[t.status] || { label: t.status, icon: '•' };
                        const isLast = i === app.timeline.length - 1;
                        return (
                          <div key={i} className="relative">
                            <div className={`absolute -left-4 w-4 h-4 rounded-full border-2 border-white flex items-center justify-center text-xs ${isLast ? 'bg-primary-600' : 'bg-surface-300'}`} />
                            <div className={`p-3 rounded-xl ${isLast ? 'bg-primary-50 border border-primary-100' : 'bg-surface-50'}`}>
                              <div className="flex items-center justify-between mb-1">
                                <span className="text-sm font-semibold text-slate-900">{ts.icon} {ts.label}</span>
                                <span className="text-xs text-slate-400">{format(new Date(t.timestamp), 'dd MMM yyyy, HH:mm')}</span>
                              </div>
                              {t.note && <p className="text-xs text-slate-500">{t.note}</p>}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
