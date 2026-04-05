import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import useAuthStore from '../../context/authStore';

export default function Sidebar({ links }) {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);
  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <aside className={`${collapsed ? 'w-[70px]' : 'w-64'} flex-shrink-0 bg-white border-r border-slate-200 flex flex-col min-h-screen transition-all duration-300`}>
      <div className="h-[68px] flex items-center justify-between px-4 border-b border-slate-100">
        {!collapsed ? (
          <>
            <NavLink to="/" className="flex items-center">
              <img src={process.env.PUBLIC_URL + '/favicon.svg'} alt="PlaceNova" className="h-9 w-auto" style={{ maxWidth: 140 }} />
            </NavLink>
            <button onClick={() => setCollapsed(true)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 19l-7-7 7-7m8 14l-7-7 7-7" /></svg>
            </button>
          </>
        ) : (
          <button onClick={() => setCollapsed(false)} className="w-9 h-9 mx-auto rounded-lg overflow-hidden hover:ring-2 hover:ring-blue-200 transition-all">
            <img src={process.env.PUBLIC_URL + '/favicon.svg'} alt="PN" className="w-9 h-9 object-cover rounded-lg" />
          </button>
        )}
      </div>
      {!collapsed && (
        <div className="p-3 border-b border-slate-100">
          <div className="flex items-center gap-3 p-2.5 rounded-xl bg-slate-50">
            <div className="w-9 h-9 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0" style={{ background: 'linear-gradient(135deg,#2563eb,#7c3aed)' }}>
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.name}</p>
              <p className="text-xs text-slate-400 capitalize">{user?.role}</p>
            </div>
          </div>
        </div>
      )}
      <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
        {links.map(({ path, label, icon }) => (
          <NavLink key={path} to={path} className={({ isActive }) => `sidebar-link ${isActive ? 'active' : ''} ${collapsed ? 'justify-center px-0' : ''}`}>
            <span className="text-lg flex-shrink-0">{icon}</span>
            {!collapsed && <span>{label}</span>}
          </NavLink>
        ))}
      </nav>
      <div className="p-3 border-t border-slate-100">
        <button onClick={handleLogout} className={`sidebar-link w-full text-red-500 hover:bg-red-50 hover:text-red-600 ${collapsed ? 'justify-center' : ''}`}>
          <span className="text-lg">🚪</span>
          {!collapsed && <span>Sign Out</span>}
        </button>
      </div>
    </aside>
  );
}
