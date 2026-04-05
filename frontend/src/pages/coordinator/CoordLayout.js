import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';

const coordLinks = [
  { path: '/coordinator/dashboard',    label: 'Dashboard',     icon: '📊' },
  { path: '/coordinator/students',     label: 'Students',      icon: '🎓' },
  { path: '/coordinator/companies',    label: 'Companies',     icon: '🏢' },
  { path: '/coordinator/applications', label: 'Applications',  icon: '📋' },
];

export default function CoordLayout() {
  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar links={coordLinks} role="coordinator" />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
