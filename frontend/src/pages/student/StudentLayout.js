import React from 'react';
import { Outlet } from 'react-router-dom';
import Sidebar from '../../components/shared/Sidebar';

const studentLinks = [
  { path: '/student/dashboard',    label: 'Dashboard',     icon: '🏠' },
  { path: '/student/companies',    label: 'Companies',     icon: '🏢' },
  { path: '/student/applications', label: 'My Applications', icon: '📋' },
  { path: '/student/profile',      label: 'Profile',       icon: '👤' },
];

export default function StudentLayout() {
  return (
    <div className="flex min-h-screen bg-surface-50">
      <Sidebar links={studentLinks} role="student" />
      <main className="flex-1 overflow-auto">
        <div className="max-w-7xl mx-auto p-6 lg:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
