import React from 'react';
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-surface-50 flex items-center justify-center p-6">
      <div className="text-center animate-slide-up">
        <div className="text-8xl mb-6">🗺️</div>
        <h1 className="text-6xl font-extrabold text-slate-900 mb-3">404</h1>
        <h2 className="text-2xl font-bold text-slate-700 mb-3">Page Not Found</h2>
        <p className="text-slate-500 mb-8 max-w-sm mx-auto">The page you're looking for doesn't exist or has been moved.</p>
        <Link to="/" className="btn-primary py-3 px-8 text-base">← Back to Home</Link>
      </div>
    </div>
  );
}
