import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Doughnut, Bar } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from 'chart.js';
import api from '../../utils/api';
import useAuthStore from '../../context/authStore';
import { format } from 'date-fns';

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement);

const STATUS_MAP = {
  applied: { label: 'Applied', color: 'badge-blue' },
  shortlisted: { label: 'Shortlisted', color: 'badge-yellow' },
  selected: { label: 'Selected 🎉', color: 'badge-green' },
  rejected: { label: 'Rejected', color: 'badge-red' },
  withdrawn: { label: 'Withdrawn', color: 'badge-gray' },
  interview_scheduled: { label: 'Interview', color: 'badge-purple' },
  aptitude_scheduled: { label: 'Aptitude', color: 'badge-yellow' },
};

export default function StudentDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    api.get('/dashboard/student').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="spinner w-8 h-8" />
    </div>
  );

  const { applicationStats, myApplications, openCompanies, appliedCompanyIds } = data || {};
  const sp = user?.studentProfile;

  const doughnutData = {
    labels: ['Selected', 'Shortlisted', 'Applied', 'Rejected'],
    datasets: [{
      data: [applicationStats?.selected || 0, applicationStats?.shortlisted || 0, applicationStats?.applied || 0, applicationStats?.rejected || 0],
      backgroundColor: ['#10b981', '#f59e0b', '#6366f1', '#ef4444'],
      borderWidth: 0, hoverOffset: 8,
    }],
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header">
        <h1 className="page-title">
          Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'},{' '}
          <span className="text-primary-600">{user?.name?.split(' ')[0]}</span> 👋
        </h1>
        <p className="page-subtitle">{sp?.branch} • Year {sp?.year} • CGPA: {sp?.cgpa || 'N/A'}</p>
      </div>

      {/* Placement Status Banner */}
      {sp?.placementStatus === 'placed' && (
        <div className="glass-card p-6 border-l-4 border-accent-500 bg-gradient-to-r from-accent-50 to-white flex items-center gap-4">
          <div className="text-4xl">🎉</div>
          <div>
            <h3 className="font-bold text-slate-900 text-lg">Congratulations! You're placed!</h3>
            <p className="text-slate-600 text-sm">You've been selected at <strong>{sp?.placedCompany?.name}</strong> with a package of <strong>₹{sp?.placedPackage} LPA</strong></p>
          </div>
        </div>
      )}

      {/* Stats Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Applied', value: applicationStats?.total || 0, icon: '📤', color: 'text-primary-600', bg: 'bg-primary-50' },
          { label: 'Shortlisted',   value: applicationStats?.shortlisted || 0, icon: '⭐', color: 'text-amber-600', bg: 'bg-amber-50' },
          { label: 'In Interview',  value: applicationStats?.shortlisted || 0, icon: '🎤', color: 'text-purple-600', bg: 'bg-purple-50' },
          { label: 'Selected',      value: applicationStats?.selected || 0, icon: '✅', color: 'text-accent-600', bg: 'bg-accent-50' },
        ].map(s => (
          <div key={s.label} className="stat-card">
            <div className={`w-10 h-10 rounded-xl ${s.bg} flex items-center justify-center text-xl`}>{s.icon}</div>
            <div className={`text-3xl font-extrabold ${s.color}`}>{s.value}</div>
            <div className="text-sm text-slate-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Application Chart */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Application Status</h3>
          {applicationStats?.total > 0 ? (
            <div className="flex items-center justify-center">
              <div style={{ width: 180, height: 180 }}>
                <Doughnut data={doughnutData} options={{ plugins: { legend: { display: false } }, cutout: '70%' }} />
              </div>
            </div>
          ) : (
            <div className="h-40 flex flex-col items-center justify-center text-slate-400">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-sm font-medium">No applications yet</p>
              <Link to="/student/companies" className="btn-primary mt-4 text-xs">Browse Companies</Link>
            </div>
          )}
        </div>

        {/* Open Companies */}
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Open Drives</h3>
            <Link to="/student/companies" className="text-xs text-primary-600 font-semibold hover:text-primary-700">View all →</Link>
          </div>
          <div className="space-y-3">
            {openCompanies?.slice(0, 4).map(c => (
              <div key={c._id} className="flex items-center gap-4 p-3 rounded-xl hover:bg-surface-50 transition-colors">
                <div className="w-10 h-10 rounded-xl bg-surface-100 flex items-center justify-center text-lg font-bold text-slate-600 flex-shrink-0">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900 truncate">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.industry} • {c.roles?.[0]?.package} LPA</p>
                </div>
                {appliedCompanyIds?.includes(c._id) ? (
                  <span className="badge-green text-xs">Applied</span>
                ) : (
                  <Link to="/student/companies" className="text-xs btn-primary py-1.5 px-3">Apply</Link>
                )}
              </div>
            ))}
            {!openCompanies?.length && (
              <div className="text-center py-8 text-slate-400">
                <div className="text-4xl mb-2">🏢</div>
                <p className="text-sm">No open drives right now</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      {myApplications?.length > 0 && (
        <div className="glass-card p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-slate-900">Recent Applications</h3>
            <Link to="/student/applications" className="text-xs text-primary-600 font-semibold">View all →</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="data-table">
              <thead><tr>
                <th>Company</th><th>Role</th><th>Applied</th><th>Status</th>
              </tr></thead>
              <tbody>
                {myApplications.slice(0, 5).map(app => {
                  const s = STATUS_MAP[app.status] || { label: app.status, color: 'badge-gray' };
                  return (
                    <tr key={app._id}>
                      <td>
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-surface-100 flex items-center justify-center text-sm font-bold text-slate-600">
                            {app.company?.name?.charAt(0)}
                          </div>
                          <span className="font-medium text-slate-900">{app.company?.name}</span>
                        </div>
                      </td>
                      <td>{app.roleTitle}</td>
                      <td className="text-slate-500">{format(new Date(app.appliedAt), 'dd MMM yyyy')}</td>
                      <td><span className={s.color}>{s.label}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
