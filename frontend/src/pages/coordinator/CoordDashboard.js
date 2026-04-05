import React, { useEffect, useState } from 'react';
import { Bar, Doughnut } from 'react-chartjs-2';
import {
  Chart as ChartJS, CategoryScale, LinearScale, BarElement,
  ArcElement, Tooltip, Legend, Title
} from 'chart.js';
import api from '../../utils/api';
import { format } from 'date-fns';

ChartJS.register(CategoryScale, LinearScale, BarElement, ArcElement, Tooltip, Legend, Title);

const MONTH_NAMES = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

const STATUS_COLORS = {
  applied:'badge-blue', shortlisted:'badge-yellow', selected:'badge-green',
  rejected:'badge-red', withdrawn:'badge-gray', interview_scheduled:'badge-purple',
};

export default function CoordDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/dashboard/coordinator').then(r => setData(r.data.data)).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="flex justify-center py-20"><div className="spinner w-10 h-10" /></div>;

  const { overview, packageStats, recentApplications, placementByBranch, monthlyPlacements, topCompanies } = data || {};

  const branchChartData = {
    labels: placementByBranch?.map(b => b._id) || [],
    datasets: [
      { label: 'Total', data: placementByBranch?.map(b => b.total) || [], backgroundColor: '#e0e7ff', borderRadius: 6 },
      { label: 'Placed', data: placementByBranch?.map(b => b.placed) || [], backgroundColor: '#6366f1', borderRadius: 6 },
    ],
  };

  const monthlyChartData = {
    labels: monthlyPlacements?.map(m => MONTH_NAMES[m._id.month - 1]) || [],
    datasets: [{
      label: 'Placements',
      data: monthlyPlacements?.map(m => m.count) || [],
      backgroundColor: '#10b981',
      borderRadius: 8,
    }],
  };

  const statusDoughnutData = {
    labels: ['Placed', 'In Process', 'Unplaced'],
    datasets: [{
      data: [
        overview?.placedStudents || 0,
        Math.floor((overview?.totalStudents - overview?.placedStudents - overview?.unplacedStudents) / 2) || 0,
        overview?.unplacedStudents || 0,
      ],
      backgroundColor: ['#10b981', '#f59e0b', '#e2e8f0'],
      borderWidth: 0,
      hoverOffset: 8,
    }],
  };

  const barOptions = {
    responsive: true,
    plugins: { legend: { position: 'top' } },
    scales: { y: { beginAtZero: true, grid: { color: '#f1f5f9' } }, x: { grid: { display: false } } },
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="page-header flex items-start justify-between">
        <div>
          <h1 className="page-title">Placement Dashboard</h1>
          <p className="page-subtitle">Overview of all placement activities — {format(new Date(), 'MMMM yyyy')}</p>
        </div>
        <div className="hidden sm:block text-right">
          <div className="text-3xl font-extrabold text-primary-600">{overview?.placementRate}%</div>
          <div className="text-xs text-slate-500 font-medium">Placement Rate</div>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
          { label: 'Total Students',    value: overview?.totalStudents || 0,    icon: '🎓', color: 'text-primary-600', bg: 'bg-primary-50', change: null },
          { label: 'Students Placed',   value: overview?.placedStudents || 0,   icon: '✅', color: 'text-accent-600', bg: 'bg-accent-50' },
          { label: 'Active Companies',  value: overview?.activeCompanies || 0,  icon: '🏢', color: 'text-blue-600', bg: 'bg-blue-50' },
          { label: 'Total Applications',value: overview?.totalApplications || 0,icon: '📤', color: 'text-purple-600', bg: 'bg-purple-50' },
        ].map((s, i) => (
          <div key={i} className="stat-card animate-slide-up" style={{ animationDelay: `${i * 0.08}s` }}>
            <div className={`w-11 h-11 rounded-xl ${s.bg} flex items-center justify-center text-2xl`}>{s.icon}</div>
            <div className={`text-3xl font-extrabold ${s.color}`}>{s.value.toLocaleString()}</div>
            <div className="text-sm text-slate-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Package Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Average Package', value: `₹${(packageStats?.avgPackage || 0).toFixed(1)} LPA`, icon: '💰' },
          { label: 'Highest Package', value: `₹${packageStats?.maxPackage || 0} LPA`, icon: '🚀' },
          { label: 'Lowest Package',  value: `₹${packageStats?.minPackage || 0} LPA`, icon: '📉' },
        ].map((s, i) => (
          <div key={i} className="glass-card p-5 text-center">
            <div className="text-3xl mb-2">{s.icon}</div>
            <div className="text-xl font-extrabold text-slate-900">{s.value}</div>
            <div className="text-xs text-slate-500 font-medium mt-1">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Charts Row 1 */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Branch-wise Placement */}
        <div className="glass-card p-6 lg:col-span-2">
          <h3 className="font-bold text-slate-900 mb-4">Branch-wise Placement</h3>
          <Bar data={branchChartData} options={barOptions} height={120} />
        </div>

        {/* Status Doughnut */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Placement Status</h3>
          <div className="flex justify-center mb-4">
            <div style={{ width: 160, height: 160 }}>
              <Doughnut data={statusDoughnutData} options={{ plugins: { legend: { display: false } }, cutout: '65%' }} />
            </div>
          </div>
          <div className="space-y-2">
            {[
              { label: 'Placed',     value: overview?.placedStudents, color: 'bg-accent-500' },
              { label: 'Unplaced',   value: overview?.unplacedStudents, color: 'bg-surface-200' },
            ].map(item => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2">
                  <div className={`w-3 h-3 rounded-full ${item.color}`} />
                  <span className="text-slate-600 font-medium">{item.label}</span>
                </div>
                <span className="font-bold text-slate-900">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Charts Row 2 */}
      <div className="grid lg:grid-cols-2 gap-6">
        {/* Monthly Placements */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Monthly Placements</h3>
          {monthlyPlacements?.length > 0 ? (
            <Bar data={monthlyChartData} options={{ ...barOptions, plugins: { legend: { display: false } } }} height={140} />
          ) : (
            <div className="h-40 flex items-center justify-center text-slate-400 text-sm">No placement data yet</div>
          )}
        </div>

        {/* Top Hiring Companies */}
        <div className="glass-card p-6">
          <h3 className="font-bold text-slate-900 mb-4">Top Hiring Companies</h3>
          <div className="space-y-3">
            {topCompanies?.map((c, i) => (
              <div key={c._id} className="flex items-center gap-3">
                <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">
                  {i + 1}
                </div>
                <div className="w-8 h-8 rounded-lg bg-surface-100 flex items-center justify-center text-sm font-bold text-slate-600">
                  {c.name.charAt(0)}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-900">{c.name}</p>
                  <p className="text-xs text-slate-500">{c.industry}</p>
                </div>
                <span className="badge-green">{c.totalHired} hired</span>
              </div>
            ))}
            {!topCompanies?.length && (
              <p className="text-center text-slate-400 text-sm py-8">No placement data yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Recent Applications */}
      <div className="glass-card p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-slate-900">Recent Applications</h3>
          <a href="/coordinator/applications" className="text-xs text-primary-600 font-semibold hover:text-primary-700">View all →</a>
        </div>
        <div className="overflow-x-auto">
          <table className="data-table">
            <thead><tr>
              <th>Student</th><th>Company</th><th>Role</th><th>Status</th><th>Applied</th>
            </tr></thead>
            <tbody>
              {recentApplications?.map(app => {
                const sc = STATUS_COLORS[app.status] || 'badge-gray';
                return (
                  <tr key={app._id}>
                    <td>
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-primary-100 flex items-center justify-center text-xs font-bold text-primary-700">
                          {app.student?.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900 text-xs">{app.student?.name}</p>
                          <p className="text-slate-400 text-xs">{app.student?.studentProfile?.branch}</p>
                        </div>
                      </div>
                    </td>
                    <td className="font-medium text-slate-900">{app.company?.name}</td>
                    <td className="text-slate-500">{app.roleTitle}</td>
                    <td><span className={sc}>{app.status?.replace(/_/g,' ')}</span></td>
                    <td className="text-slate-400">{format(new Date(app.createdAt), 'dd MMM')}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {!recentApplications?.length && (
            <div className="text-center py-8 text-slate-400 text-sm">No applications yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
