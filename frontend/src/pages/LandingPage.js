import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';

// ─── SVG Logo Components ──────────────────────────────────────────────────────
// ...existing code...

// ─── Data ─────────────────────────────────────────────────────────────────────
const FEATURES = [
  { icon: '🎯', title: 'Smart Job Matching', desc: 'Auto-match students with companies by CGPA, branch, and skills — zero manual filtering required.', col: 'from-blue-500/10 to-blue-600/5', border: 'hover:border-blue-200', ico: 'bg-blue-50' },
  { icon: '📊', title: 'Real-time Analytics', desc: 'Live placement stats, branch-wise charts, package trends, and hiring funnel insights at a glance.', col: 'from-cyan-500/10 to-cyan-600/5', border: 'hover:border-cyan-200', ico: 'bg-cyan-50' },
  { icon: '🔔', title: 'Application Tracking', desc: 'Full timeline from application to offer letter — every milestone tracked with instant updates.', col: 'from-violet-500/10 to-violet-600/5', border: 'hover:border-violet-200', ico: 'bg-violet-50' },
  { icon: '🏢', title: 'Company Management', desc: 'Coordinators manage drives, roles, eligibility, HR contacts from a single powerful dashboard.', col: 'from-emerald-500/10 to-emerald-600/5', border: 'hover:border-emerald-200', ico: 'bg-emerald-50' },
  { icon: '🔐', title: 'Secure by Design', desc: 'JWT auth, bcrypt hashing, rate limiting, Trivy scanning, and SonarQube code quality built in.', col: 'from-amber-500/10 to-amber-600/5', border: 'hover:border-amber-200', ico: 'bg-amber-50' },
  { icon: '☁️', title: 'Cloud-Native CI/CD', desc: 'Jenkins → Docker → Kubernetes on AWS EKS with ArgoCD GitOps, Prometheus, and ELK Stack.', col: 'from-pink-500/10 to-pink-600/5', border: 'hover:border-pink-200', ico: 'bg-pink-50' },
];

const STEPS = [
  { num: '01', icon: '⬆️', title: 'Push to GitHub', desc: 'Developer pushes code. GitHub webhook triggers Jenkins pipeline automatically.' },
  { num: '02', icon: '🧪', title: 'Test + Scan', desc: 'Jest tests, SonarQube quality gate, and Trivy CVE scans run in parallel.' },
  { num: '03', icon: '🐳', title: 'Build + Push', desc: 'Multi-stage Docker images built and pushed to Docker Hub registry.' },
  { num: '04', icon: '☸️', title: 'Deploy via ArgoCD', desc: 'ArgoCD auto-syncs to AWS EKS. HPA scales pods 2→10 under load.' },
];

const STATS = [
  { val: '500+', label: 'Students Placed', color: 'text-blue-600' },
  { val: '120+', label: 'Partner Companies', color: 'text-cyan-600' },
  { val: '₹18 LPA', label: 'Avg Package', color: 'text-violet-600' },
  { val: '94%', label: 'Placement Rate', color: 'text-emerald-600' },
];

// ─── Recruiter Logos (SVG inline for crispness) ───────────────────────────────
const RECRUITERS = [
  {
    name: 'Google', color: '#4285F4',
    logo: (
      <svg viewBox="0 0 56 56" width="52" height="52" fill="none">
        <path d="M50.5 28.6c0-1.5-.1-3-.4-4.4H28v8.4h12.7c-.6 3-2.4 5.6-5 7.3v6h8c4.7-4.3 7.4-10.7 7.4-17.9-.1.2-.1.4-.6.6z" fill="#4285F4"/>
        <path d="M28 51c6.5 0 11.9-2.1 15.8-5.8l-7.7-6c-2.1 1.4-4.8 2.3-8.1 2.3-6.2 0-11.5-4.2-13.4-9.9H6.3v6.2C10.2 46.8 18.5 51 28 51z" fill="#34A853"/>
        <path d="M14.6 31.6c-.5-1.5-.8-3-.8-4.6s.3-3.1.8-4.6v-6.2H6.3C4.5 19.8 3.5 23.8 3.5 28s1 8.2 2.8 11.8l8.3-6.2-.0-.0z" fill="#FBBC04"/>
        <path d="M28 14.8c3.4 0 6.5 1.2 8.9 3.5l6.6-6.6C39.9 7.9 34.5 5.5 28 5.5c-9.5 0-17.8 4.2-21.7 10.5l8.3 6.5C16.5 18.9 21.8 14.8 28 14.8z" fill="#EA4335"/>
      </svg>
    )
  },
  {
    name: 'Apple', color: '#000000',
    logo: (
      <svg viewBox="0 0 56 56" width="42" height="42" fill="#1d1d1f">
        <path d="M39.1 29.3c-.1-5.5 4.5-8.1 4.7-8.3-2.5-3.7-6.5-4.2-7.9-4.3-3.4-.3-6.6 2-8.3 2-1.7 0-4.2-2-7-1.9-3.6.1-6.9 2.1-8.7 5.3-3.7 6.4-.9 15.9 2.6 21.1 1.8 2.5 3.8 5.4 6.6 5.3 2.6-.1 3.6-1.7 6.8-1.7 3.1 0 4 1.7 6.8 1.6 2.8-.1 4.6-2.6 6.4-5.2 2-2.9 2.8-5.8 2.8-5.9-.1 0-5.8-2.3-5.8-7.8-.0-.1.0-.2-.0-.2zM33.6 11.9c1.4-1.7 2.4-4.2 2.1-6.6-2 .1-4.5 1.3-5.9 3-1.3 1.5-2.4 4-2.1 6.3 2.2.1 4.5-1.1 5.9-2.7z"/>
      </svg>
    )
  },
  {
    name: 'Amazon', color: '#FF9900',
    logo: (
      <svg viewBox="0 0 120 44" width="100" height="36">
        <text x="4" y="28" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="26" fill="#232F3E" letterSpacing="-1">amazon</text>
        <path d="M8 36 Q58 50 108 30" stroke="#FF9900" strokeWidth="3" fill="none" strokeLinecap="round"/>
        <polygon points="102,26 110,32 104,38" fill="#FF9900"/>
      </svg>
    )
  },
  {
    name: 'Samsung', color: '#1428A0',
    logo: (
      <svg viewBox="0 0 130 36" width="112" height="30">
        <rect width="130" height="36" rx="6" fill="#1428A0"/>
        <text x="65" y="25" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="16" fill="white" textAnchor="middle" letterSpacing="1">SAMSUNG</text>
      </svg>
    )
  },
  {
    name: 'Microsoft', color: '#0078D4',
    logo: (
      <svg viewBox="0 0 52 52" width="44" height="44" fill="none">
        <rect x="0" y="0" width="23" height="23" fill="#F25022"/>
        <rect x="26" y="0" width="23" height="23" fill="#7FBA00"/>
        <rect x="0" y="26" width="23" height="23" fill="#00A4EF"/>
        <rect x="26" y="26" width="23" height="23" fill="#FFB900"/>
      </svg>
    )
  },
  {
    name: 'Adobe', color: '#FA0F00',
    logo: (
      <svg viewBox="0 0 56 52" width="48" height="44" fill="none">
        <path d="M2 48L20 4h14L2 48z" fill="#FA0F00"/>
        <path d="M54 48L36 4H22L54 48z" fill="#FA0F00"/>
        <path d="M28 20l10 28H18L28 20z" fill="#FA0F00"/>
      </svg>
    )
  },
  {
    name: 'Infosys', color: '#007CC3',
    logo: (
      <svg viewBox="0 0 110 28" width="98" height="25">
        <text x="0" y="22" fontFamily="Arial,sans-serif" fontWeight="700" fontSize="22" fill="#007CC3" letterSpacing="-0.5">infosys</text>
      </svg>
    )
  },
  {
    name: 'IBM', color: '#1F70C1',
    logo: (
      <svg viewBox="0 0 80 32" width="68" height="28">
        <text x="2" y="25" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="28" fill="#1F70C1" letterSpacing="3">IBM</text>
      </svg>
    )
  },
  {
    name: 'TCS', color: '#003087',
    logo: (
      <svg viewBox="0 0 80 36" width="70" height="30">
        <rect width="80" height="36" rx="5" fill="#003087"/>
        <text x="40" y="24" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="19" fill="white" textAnchor="middle" letterSpacing="3">TCS</text>
      </svg>
    )
  },
  {
    name: 'NVIDIA', color: '#76B900',
    logo: (
      <svg viewBox="0 0 110 28" width="96" height="25">
        <text x="0" y="22" fontFamily="Arial,sans-serif" fontWeight="900" fontSize="22" fill="#76B900" letterSpacing="0">NVIDIA</text>
      </svg>
    )
  },
];

// ─── Tech Stack Pills ─────────────────────────────────────────────────────────
const TECH = [
  { name: 'React 18',       color: '#61dafb' },
  { name: 'Tailwind CSS',   color: '#38bdf8' },
  { name: 'Node.js 20',     color: '#68a063' },
  { name: 'MongoDB',        color: '#47a248' },
  { name: 'Docker',         color: '#2496ed' },
  { name: 'Kubernetes',     color: '#326ce5' },
  { name: 'Jenkins',        color: '#d24939' },
  { name: 'GitHub',         color: '#181717' },
  { name: 'SonarQube',      color: '#4e9bcd' },
  { name: 'Trivy',          color: '#1e88e5' },
  { name: 'ArgoCD',         color: '#e86d28' },
  { name: 'AWS EKS',        color: '#ff9900' },
  { name: 'Terraform',      color: '#7b42bc' },
  { name: 'Ansible',        color: '#ee0000' },
  { name: 'Prometheus',     color: '#e6522c' },
  { name: 'Grafana',        color: '#f46800' },
  { name: 'Elasticsearch',  color: '#005571' },
  { name: 'Kibana',         color: '#00bfb3' },
  { name: 'JWT Auth',       color: '#764abc' },
];

// ─── Animated Tagline ─────────────────────────────────────────────────────────
function TaglineAnimator() {
  const words = TAGLINE_WORDS;
  const [visible, setVisible] = useState([]);

  useEffect(() => {
    const show = () => {
      words.forEach((_, i) => {
        setTimeout(() => setVisible(v => [...v, i]), i * 200);
      });
    };
    show();
    const interval = setInterval(() => {
      setVisible([]);
      setTimeout(show, 300);
    }, 5500);
    return () => clearInterval(interval);
  }, [words]);

  return (
    <div className="flex items-center justify-center flex-wrap gap-x-1 gap-y-1 min-h-[48px] mt-4 mb-5">
      {words.map((w, i) => (
        <React.Fragment key={i}>
          <span
            className="tagline-word text-2xl md:text-3xl"
            style={{ color: w.color, transitionDelay: `${i * 0.08}s` }}
            data-visible={visible.includes(i) ? 'true' : 'false'}
          >
            {visible.includes(i) && <span style={{ opacity: 1, transform: 'none', display: 'inline-block' }}>{w.text}</span>}
          </span>
          {i < words.length - 1 && (
            <span className="text-2xl font-thin text-slate-300 mx-1">•</span>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

const TAGLINE_WORDS = [
  { text: 'Track',      color: '#2563eb' },
  { text: 'Manage',     color: '#06b6d4' },
  { text: 'Analyze',    color: '#7c3aed' },
  { text: 'Get Placed', color: '#10b981' },
];

// ─── Dashboard Mockup ─────────────────────────────────────────────────────────
function DashboardMockup() {
  return (
    <div className="rounded-2xl border border-slate-200 overflow-hidden"
         style={{ boxShadow: '0 30px 80px rgba(37,99,235,.14), 0 4px 16px rgba(0,0,0,.06)', background: '#0d1425' }}>
      {/* Browser chrome */}
      <div className="h-11 flex items-center px-4 gap-2 border-b" style={{ background: '#161e35', borderColor: 'rgba(255,255,255,.08)' }}>
        <div className="w-3 h-3 rounded-full bg-[#ff5f57]" />
        <div className="w-3 h-3 rounded-full bg-[#febc2e]" />
        <div className="w-3 h-3 rounded-full bg-[#28c840]" />
        <div className="ml-3 flex-1 h-6 rounded-md flex items-center px-3"
             style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)' }}>
          <span className="text-xs" style={{ color: '#64748b' }}>🔒 placetrack.srm.edu/coordinator/dashboard</span>
        </div>
      </div>

      {/* App body */}
      <div className="flex" style={{ height: 380 }}>
        {/* Sidebar */}
        <div className="w-14 flex flex-col items-center py-4 gap-3 border-r" style={{ background: '#111827', borderColor: 'rgba(255,255,255,.08)' }}>
          {/* PN badge */}
          <div className="w-8 h-8 rounded-lg mb-1 flex-shrink-0 overflow-hidden">
            <img src={process.env.PUBLIC_URL + '/favicon.svg'} alt="PN" className="w-full h-full object-cover" />
          </div>
          {['📊','🎓','🏢','📋','👤'].map((ic, i) => (
            <div key={i} className="w-9 h-9 rounded-lg flex items-center justify-center text-sm cursor-pointer transition-all"
                 style={{ background: i === 0 ? 'rgba(37,99,235,.3)' : 'transparent' }}>
              {ic}
            </div>
          ))}
        </div>

        {/* Main content */}
        <div className="flex-1 p-3 overflow-hidden" style={{ background: '#0d1425' }}>
          {/* KPI Row */}
          <div className="grid grid-cols-4 gap-2 mb-3">
            {[
              { lbl: 'STUDENTS', val: '1,240', sub: '↑ 12%', sc: '#10b981' },
              { lbl: 'PLACED',   val: '847',   sub: '↑ 8%',  sc: '#10b981' },
              { lbl: 'COMPANIES',val: '43',    sub: 'Active',sc: '#3b82f6' },
              { lbl: 'AVG PKG',  val: '₹18L',  sub: '↑ 5%',  sc: '#10b981' },
            ].map(k => (
              <div key={k.lbl} className="rounded-xl p-2.5" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.08)' }}>
                <div className="text-xs font-bold tracking-widest mb-1" style={{ color: '#64748b', fontSize: '0.5rem' }}>{k.lbl}</div>
                <div className="font-display font-extrabold" style={{ color: '#f0f4ff', fontSize: '1.15rem', lineHeight: 1 }}>{k.val}</div>
                <div className="text-xs font-semibold mt-0.5" style={{ color: k.sc, fontSize: '0.58rem' }}>{k.sub}</div>
              </div>
            ))}
          </div>

          {/* Charts Row */}
          <div className="grid gap-2 mb-3" style={{ gridTemplateColumns: '1.5fr 1fr', height: 165 }}>
            {/* Bar chart */}
            <div className="rounded-xl p-3" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
              <div className="text-xs font-bold tracking-widest mb-2" style={{ color: '#64748b', fontSize: '0.58rem' }}>BRANCH-WISE PLACEMENTS</div>
              <div className="flex items-end gap-1.5" style={{ height: 90 }}>
                {[
                  { h: '72%', g: 'linear-gradient(180deg,#3b82f6,#2563eb)' },
                  { h: '50%', g: 'linear-gradient(180deg,#06b6d4,#0891b2)' },
                  { h: '88%', g: 'linear-gradient(180deg,#7c3aed,#6d28d9)' },
                  { h: '40%', g: 'linear-gradient(180deg,#10b981,#059669)' },
                  { h: '62%', g: 'linear-gradient(180deg,#f59e0b,#d97706)' },
                  { h: '30%', g: 'linear-gradient(180deg,#ec4899,#db2777)' },
                ].map((b, i) => (
                  <div key={i} className="flex-1 rounded-t-sm transition-opacity hover:opacity-75" style={{ height: b.h, background: b.g }} />
                ))}
              </div>
              <div className="flex gap-3 mt-1.5">
                {[['#2563eb','CSE'],['#0891b2','IT'],['#7c3aed','ECE']].map(([c,l]) => (
                  <span key={l} className="flex items-center gap-1" style={{ fontSize:'0.52rem', color:'#94a3b8' }}>
                    <span style={{ width:6, height:6, background:c, borderRadius:1, display:'inline-block' }}/>
                    {l}
                  </span>
                ))}
              </div>
            </div>

            {/* Donut chart */}
            <div className="rounded-xl p-3 flex flex-col" style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)' }}>
              <div className="text-xs font-bold tracking-widest mb-2" style={{ color: '#64748b', fontSize: '0.58rem' }}>PLACEMENT RATE</div>
              <div className="flex-1 flex items-center justify-center relative">
                <svg width="100" height="100" viewBox="0 0 100 100">
                  <circle cx="50" cy="50" r="38" fill="none" stroke="rgba(255,255,255,.08)" strokeWidth="11"/>
                  <circle cx="50" cy="50" r="38" fill="none" stroke="url(#dg)" strokeWidth="11"
                    strokeDasharray="226 239" strokeDashoffset="57" strokeLinecap="round"/>
                  <defs>
                    <linearGradient id="dg" x1="0" y1="0" x2="1" y2="1">
                      <stop offset="0%" stopColor="#2563eb"/>
                      <stop offset="100%" stopColor="#06b6d4"/>
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <div className="font-display font-extrabold" style={{ color: '#f0f4ff', fontSize: '1.2rem', lineHeight:1 }}>94%</div>
                  <div style={{ color: '#64748b', fontSize: '0.5rem', textTransform:'uppercase', letterSpacing:'.05em' }}>PLACED</div>
                </div>
              </div>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,.08)' }}>
            <div className="grid px-3 py-1.5 text-xs font-bold tracking-widest" style={{ gridTemplateColumns:'2fr 1.2fr .9fr', background:'rgba(255,255,255,.04)', color:'#64748b', fontSize:'0.52rem', borderBottom:'1px solid rgba(255,255,255,.07)' }}>
              <span>STUDENT</span><span>COMPANY</span><span>STATUS</span>
            </div>
            {[
              { n:'Rahul Sharma', b:'CSE • 8.7',  co:'Google India', s:'Shortlisted', sc:'#d97706', bg:'rgba(245,158,11,.15)' },
              { n:'Sneha Patel',  b:'CSE • 9.1',  co:'Google India', s:'Selected 🎉', sc:'#10b981', bg:'rgba(16,185,129,.15)' },
              { n:'Arjun Kumar',  b:'IT • 7.8',   co:'Amazon',       s:'Applied',     sc:'#3b82f6', bg:'rgba(37,99,235,.15)'  },
            ].map((r, i) => (
              <div key={i} className="grid px-3 py-2 items-center border-b last:border-0" style={{ gridTemplateColumns:'2fr 1.2fr .9fr', borderColor:'rgba(255,255,255,.05)' }}>
                <div>
                  <div style={{ color:'#f0f4ff', fontWeight:600, fontSize:'0.65rem' }}>{r.n}</div>
                  <div style={{ color:'#64748b', fontSize:'0.55rem' }}>{r.b}</div>
                </div>
                <div style={{ color:'#94a3b8', fontSize:'0.63rem' }}>{r.co}</div>
                <span className="text-xs px-2 py-0.5 rounded-full font-bold" style={{ background:r.bg, color:r.sc, fontSize:'0.58rem' }}>{r.s}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Main Landing Page ────────────────────────────────────────────────────────
export default function LandingPage() {
  const [navScrolled, setNavScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => setNavScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll-triggered reveal
  useEffect(() => {
    const obs = new IntersectionObserver(entries => {
      entries.forEach(e => {
        if (e.isIntersecting) {
          e.target.style.opacity = '1';
          e.target.style.transform = 'translateY(0)';
        }
      });
    }, { threshold: 0.1 });
    document.querySelectorAll('.reveal').forEach(el => {
      el.style.opacity = '0';
      el.style.transform = 'translateY(24px)';
      el.style.transition = `opacity .65s ease ${el.dataset.delay || '0'}ms, transform .65s ease ${el.dataset.delay || '0'}ms`;
      obs.observe(el);
    });
    return () => obs.disconnect();
  }, []);

  return (
    <div className="min-h-screen bg-white overflow-x-hidden">

      {/* ─── Navbar ─────────────────────────────────────────────────────── */}
      <nav className={`fixed top-0 inset-x-0 z-50 flex items-center justify-between px-[5%] h-[68px] transition-all duration-300 ${
        navScrolled ? 'bg-white/95 backdrop-blur-xl shadow-sm border-b border-slate-100' : 'bg-white/80 backdrop-blur-lg'
      }`}>
        {/* Logo — SVG image, NO text beside it since text is in the SVG */}
        <Link to="/" className="flex items-center">
          <img
            src={process.env.PUBLIC_URL + '/favicon.svg'}
            alt="PlaceNova"
            className="h-11 w-auto object-contain"
            style={{ maxWidth: 160 }}
          />
        </Link>

        <ul className="hidden md:flex items-center gap-8 list-none">
          {[['#features','Features'],['#dashboard','Dashboard'],['#pipeline','CI/CD'],['#recruiters','Recruiters'],['#stack','Tech Stack']].map(([href, label]) => (
            <li key={href}>
              <a href={href} className="text-sm font-semibold text-slate-600 hover:text-blue-600 transition-colors relative group">
                {label}
                <span className="absolute -bottom-0.5 left-0 w-0 h-0.5 bg-blue-600 rounded transition-all duration-300 group-hover:w-full" />
              </a>
            </li>
          ))}
        </ul>

        <div className="flex items-center gap-3">
          <Link to="/login" className="hidden sm:inline-flex items-center px-4 py-2 rounded-xl text-sm font-semibold text-slate-700 border border-slate-200 hover:border-blue-300 hover:text-blue-600 bg-white transition-all duration-200 shadow-sm">
            Sign In
          </Link>
          <Link to="/register" className="inline-flex items-center px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all duration-200"
                style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: '0 2px 12px rgba(37,99,235,.35)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 4px 20px rgba(37,99,235,.5)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 2px 12px rgba(37,99,235,.35)'}>
            Get Started →
          </Link>
        </div>
      </nav>

      {/* ─── Hero ───────────────────────────────────────────────────────── */}
      <section className="hero-section min-h-screen flex flex-col items-center justify-center text-center px-[5%] pt-28 pb-20 relative overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute top-0 right-0 w-[500px] h-[500px] pointer-events-none" style={{ background: 'radial-gradient(circle at 70% 30%,rgba(37,99,235,.1),transparent 65%)' }} />
        <div className="absolute bottom-0 left-0 w-[420px] h-[420px] pointer-events-none" style={{ background: 'radial-gradient(circle at 30% 70%,rgba(124,58,237,.08),transparent 65%)' }} />
        <div className="absolute inset-0 pointer-events-none" style={{ backgroundImage: 'linear-gradient(rgba(37,99,235,.025) 1px,transparent 1px),linear-gradient(90deg,rgba(37,99,235,.025) 1px,transparent 1px)', backgroundSize: '48px 48px' }} />

        {/* Badge */}
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full mb-8 anim-down"
             style={{ background: 'rgba(37,99,235,.08)', border: '1px solid rgba(37,99,235,.18)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse-dot" />
          <span className="text-xs font-bold text-blue-600 uppercase tracking-widest">
            Automated Cloud-Based Placement Tracker Using CI/CD
          </span>
        </div>

        {/* Main heading — bold, Geist font matching screenshot */}
        <h1 className="font-display font-black leading-none tracking-tighter mb-2 anim-down d1"
            style={{ fontSize: 'clamp(3rem,8vw,6rem)', color: '#0f172a' }}>
          SRM Placement Hub
        </h1>

        {/* Animated tagline */}
        <TaglineAnimator />

        {/* Description — unchanged */}
        <p className="max-w-[580px] text-lg text-slate-500 leading-relaxed mb-10 anim-down d3 font-medium">
          A single platform for students to track applications, for coordinators to manage drives,
          and for everyone to celebrate placements — powered by the cloud.
        </p>

        {/* CTA Buttons */}
        <div className="flex flex-wrap gap-4 justify-center mb-16 anim-down d4">
          <Link to="/register?role=student"
                className="px-8 py-4 rounded-2xl font-bold text-base text-white transition-all duration-300 hover:-translate-y-1"
                style={{ background: 'linear-gradient(135deg,#2563eb,#1d4ed8)', boxShadow: '0 4px 24px rgba(37,99,235,.4)' }}
                onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(37,99,235,.55)'}
                onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(37,99,235,.4)'}>
            I'm a Student →
          </Link>
          <Link to="/register?role=coordinator"
                className="px-8 py-4 rounded-2xl font-bold text-base text-slate-700 bg-white border-2 border-slate-200 hover:border-blue-300 hover:text-blue-600 transition-all duration-300 hover:-translate-y-1 shadow-sm hover:shadow-md">
            I'm a Coordinator →
          </Link>
        </div>

        {/* Stats strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full max-w-[680px] anim-down d5">
          {STATS.map((s, i) => (
            <div key={i} className="bg-white rounded-2xl p-5 text-center border border-slate-200 shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-card-h">
              <div className={`font-display font-extrabold text-2xl tracking-tight ${s.color}`}>{s.val}</div>
              <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider mt-1">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── Features ───────────────────────────────────────────────────── */}
      <section id="features" className="py-24 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-[5%]">
          <div className="text-center mb-16 reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs font-bold text-blue-600 uppercase tracking-widest" style={{ background:'rgba(37,99,235,.07)', border:'1px solid rgba(37,99,235,.15)' }}>
              Why PlaceNova
            </div>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-slate-900 mb-4">Everything your placement cell needs</h2>
            <p className="text-lg text-slate-500 max-w-lg mx-auto">Built for modern institutions — automated, data-driven, and cloud-native from day one.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {FEATURES.map((f, i) => (
              <div key={i} className={`reveal p-7 rounded-2xl bg-gradient-to-br ${f.col} border border-slate-100 ${f.border} cursor-default transition-all duration-300 hover:-translate-y-1`}
                   data-delay={i * 70}
                   style={{ transitionDuration: '0.3s' }}
                   onMouseEnter={e => e.currentTarget.style.boxShadow = '0 16px 48px rgba(37,99,235,.1)'}
                   onMouseLeave={e => e.currentTarget.style.boxShadow = ''}>
                <div className={`w-12 h-12 rounded-xl ${f.ico} flex items-center justify-center text-2xl mb-5`}>{f.icon}</div>
                <h3 className="font-display font-bold text-base text-slate-900 mb-2">{f.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Dashboard Preview ──────────────────────────────────────────── */}
      <section id="dashboard" className="py-24" style={{ background: 'linear-gradient(160deg,#f0f5ff,#ffffff,#f5f0ff)' }}>
        <div className="max-w-7xl mx-auto px-[5%]">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left copy */}
            <div className="reveal">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs font-bold text-blue-600 uppercase tracking-widest" style={{ background:'rgba(37,99,235,.07)', border:'1px solid rgba(37,99,235,.15)' }}>
                Product Preview
              </div>
              <h2 className="font-display font-extrabold text-4xl tracking-tight text-slate-900 mb-4">A dashboard built for clarity</h2>
              <p className="text-lg text-slate-500 mb-8">Real-time KPIs, branch-wise placement charts, application funnels — all in one view.</p>
              <ul className="space-y-4">
                {[
                  ['4 live KPI cards', 'students, placements, companies, avg package'],
                  ['Branch-wise bar chart', 'interactive, color-coded by department'],
                  ['Placement rate doughnut', 'real-time percentage visualization'],
                  ['Live applications table', 'color-coded status badges for every student'],
                ].map(([bold, rest], i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-5 h-5 rounded-md flex items-center justify-center text-xs text-white font-bold mt-0.5 flex-shrink-0"
                         style={{ background: 'linear-gradient(135deg,#2563eb,#06b6d4)' }}>✓</div>
                    <span className="text-sm text-slate-600"><strong className="text-slate-900">{bold}</strong> — {rest}</span>
                  </li>
                ))}
              </ul>
            </div>
            {/* Dashboard mockup */}
            <div className="reveal" data-delay="100">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* ─── CI/CD Pipeline ─────────────────────────────────────────────── */}
      <section id="pipeline" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-[5%]">
          <div className="text-center mb-16 reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs font-bold text-blue-600 uppercase tracking-widest" style={{ background:'rgba(37,99,235,.07)', border:'1px solid rgba(37,99,235,.15)' }}>
              CI/CD Pipeline
            </div>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-slate-900 mb-4">From code push to production in minutes</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">11-stage automated pipeline: Jenkins, SonarQube, Trivy, Docker, Kubernetes, ArgoCD, AWS EKS.</p>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {STEPS.map((s, i) => (
              <div key={i} className={`reveal p-7 rounded-2xl bg-white border border-slate-200 transition-all duration-300 hover:-translate-y-1 relative overflow-hidden`}
                   data-delay={i * 80}
                   onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 16px 48px rgba(37,99,235,.12)'; e.currentTarget.style.borderColor = 'rgba(37,99,235,.2)'; }}
                   onMouseLeave={e => { e.currentTarget.style.boxShadow = ''; e.currentTarget.style.borderColor = ''; }}>
                {/* Top accent line */}
                <div className="absolute top-0 left-0 right-0 h-0.5 rounded-t-2xl transition-all duration-300" style={{ background: 'linear-gradient(90deg,#2563eb,#06b6d4)', transform: 'scaleX(0)', transformOrigin: 'left' }}
                     onMouseEnter={e => e.currentTarget.style.transform = 'scaleX(1)'}/>
                <div className="font-display font-black text-5xl mb-4 tracking-tighter" style={{ color: 'rgba(37,99,235,.07)', lineHeight: 1 }}>{s.num}</div>
                <div className="text-2xl mb-3">{s.icon}</div>
                <h3 className="font-display font-bold text-base text-slate-900 mb-2">{s.title}</h3>
                <p className="text-sm text-slate-500 leading-relaxed">{s.desc}</p>
                {i < STEPS.length - 1 && (
                  <div className="hidden lg:block absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 text-slate-300 text-xl font-light z-10">›</div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Top Recruiters ─────────────────────────────────────────────── */}
      <section id="recruiters" className="py-24" style={{ background: 'linear-gradient(160deg,#f8faff,#ffffff)' }}>
        <div className="max-w-7xl mx-auto px-[5%]">
          <div className="text-center mb-16 reveal">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full mb-4 text-xs font-bold text-blue-600 uppercase tracking-widest" style={{ background:'rgba(37,99,235,.07)', border:'1px solid rgba(37,99,235,.15)' }}>
              Hiring Partners
            </div>
            <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-slate-900 mb-4">Top Recruiters & Hiring Partners</h2>
            <p className="text-lg text-slate-500 max-w-xl mx-auto">Leading global companies that hire from our campus placement drives every year.</p>
          </div>

          {/* Recruiters grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 reveal">
            {RECRUITERS.map((r, i) => (
              <div key={i}
                   className="flex flex-col items-center justify-center gap-3 p-5 bg-white rounded-2xl border border-slate-200 cursor-default transition-all duration-300 hover:-translate-y-2 min-h-[100px]"
                   data-delay={i * 50}
                   onMouseEnter={e => {
                     e.currentTarget.style.boxShadow = `0 12px 40px ${r.color}28`;
                     e.currentTarget.style.borderColor = `${r.color}33`;
                     e.currentTarget.style.transform = 'translateY(-6px) scale(1.02)';
                   }}
                   onMouseLeave={e => {
                     e.currentTarget.style.boxShadow = '';
                     e.currentTarget.style.borderColor = '';
                     e.currentTarget.style.transform = '';
                   }}>
                <div className="flex items-center justify-center h-12">
                  {r.logo}
                </div>
                <div className="text-xs font-bold text-slate-400">{r.name}</div>
              </div>
            ))}
          </div>

          {/* Hiring stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-5 mt-12 reveal" data-delay="200">
            {[
              { val:'₹45 LPA', lbl:'Highest Package',   g:'linear-gradient(135deg,#2563eb,#06b6d4)' },
              { val:'120+',    lbl:'Hiring Partners',    g:'linear-gradient(135deg,#7c3aed,#3b82f6)' },
              { val:'2,000+',  lbl:'Annual Drives',      g:'linear-gradient(135deg,#06b6d4,#10b981)' },
              { val:'94%',     lbl:'Placement Rate',     g:'linear-gradient(135deg,#f59e0b,#2563eb)' },
            ].map((s, i) => (
              <div key={i} className="bg-white rounded-2xl p-6 text-center border border-slate-200 shadow-card hover:shadow-card-h transition-all duration-300 hover:-translate-y-1">
                <div className="font-display font-extrabold text-2xl tracking-tight mb-1" style={{ background: s.g, WebkitBackgroundClip:'text', WebkitTextFillColor:'transparent', backgroundClip:'text' }}>{s.val}</div>
                <div className="text-xs text-slate-400 font-semibold uppercase tracking-wider">{s.lbl}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Tech Stack ─────────────────────────────────────────────────── */}
      <section id="stack" className="py-20 bg-white border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-[5%]">
          <div className="text-center mb-10 reveal">
            <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Complete cloud-native technology stack</p>
          </div>
          <div className="flex flex-wrap gap-2.5 justify-center reveal" data-delay="100">
            {TECH.map((t, i) => (
              <div key={i}
                   className="flex items-center gap-2 px-4 py-2 bg-white rounded-full border border-slate-200 text-sm font-semibold text-slate-500 cursor-default transition-all duration-200 shadow-sm"
                   onMouseEnter={e => {
                     e.currentTarget.style.color = t.color;
                     e.currentTarget.style.borderColor = t.color + '50';
                     e.currentTarget.style.background = t.color + '08';
                     e.currentTarget.style.transform = 'translateY(-2px)';
                     e.currentTarget.style.boxShadow = `0 4px 14px ${t.color}25`;
                   }}
                   onMouseLeave={e => {
                     e.currentTarget.style.color = '';
                     e.currentTarget.style.borderColor = '';
                     e.currentTarget.style.background = '';
                     e.currentTarget.style.transform = '';
                     e.currentTarget.style.boxShadow = '';
                   }}>
                <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: t.color }} />
                {t.name}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CTA ────────────────────────────────────────────────────────── */}
      <section className="py-24" style={{ background: 'linear-gradient(135deg,#1e3a8a,#1d4ed8 35%,#0284c7 65%,#0891b2)', position:'relative', overflow:'hidden' }}>
        <div className="absolute top-0 right-0 w-72 h-72 rounded-full pointer-events-none" style={{ background:'rgba(255,255,255,.06)', transform:'translate(40%,-40%)' }} />
        <div className="absolute bottom-0 left-0 w-56 h-56 rounded-full pointer-events-none" style={{ background:'rgba(255,255,255,.04)', transform:'translate(-40%,40%)' }} />
        <div className="max-w-3xl mx-auto px-[5%] text-center relative z-10">
          <h2 className="font-display font-extrabold text-4xl md:text-5xl tracking-tight text-white mb-4">Ready to transform your placement process?</h2>
          <p className="text-lg text-blue-100 mb-10 max-w-xl mx-auto">Join students and coordinators at SRM who trust PlaceNova to manage placements end-to-end — automated, cloud-powered, and always on.</p>
          <div className="flex flex-wrap gap-4 justify-center">
            <Link to="/register" className="px-9 py-4 rounded-2xl font-bold text-base text-blue-700 bg-white transition-all duration-300 hover:-translate-y-1"
                  style={{ boxShadow:'0 4px 24px rgba(0,0,0,.2)' }}
                  onMouseEnter={e => e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,.3)'}
                  onMouseLeave={e => e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,.2)'}>
              Start for Free →
            </Link>
            <Link to="/login" className="px-9 py-4 rounded-2xl font-bold text-base text-white border-2 border-white/25 hover:bg-white/12 transition-all duration-300 hover:-translate-y-1 backdrop-blur-sm">
              Sign In
            </Link>
          </div>
        </div>
      </section>

      {/* ─── Footer ─────────────────────────────────────────────────────── */}
      <footer style={{ background: '#0f172a' }} className="px-[5%] pt-12 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-4 gap-10 mb-10">
            <div>
              <div className="flex items-center mb-4">
                <img src={process.env.PUBLIC_URL + '/favicon.svg'} alt="PlaceNova" className="h-9 w-auto" />
              </div>
              <p className="text-sm text-slate-400 leading-relaxed max-w-[220px]">SRM's automated cloud-based placement tracker — powered by Jenkins, Docker, Kubernetes & AWS.</p>
            </div>
              {[
                ['Product', ['Features','Dashboard','Analytics','Companies']],
                ['DevOps',  ['CI/CD Pipeline','Kubernetes','AWS Setup','Monitoring']],
                ['Resources',['Documentation','GitHub','Architecture','API Docs']],
              ].map(([title, links]) => (
                <div key={title}>
                  <div className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-4">{title}</div>
                  <div className="flex flex-col gap-2.5">
                    {links.map(l => (
                      <a key={l} href={`#${l.replace(/\s+/g,'-').toLowerCase()}`} className="text-sm text-slate-400 hover:text-white transition-colors">{l}</a>
                    ))}
                  </div>
                </div>
              ))}
          </div>
          <div className="border-t border-slate-800 pt-6 flex flex-wrap items-center justify-between gap-4">
            <p className="text-xs text-slate-500">© 2024 PlaceNova — SRM Placement Hub. Automated Cloud-Based Placement Tracker using CI/CD.</p>
            <div className="flex gap-2">
              {['AWS EKS','Jenkins CI/CD','ArgoCD GitOps'].map(b => (
                <span key={b} className="text-xs px-3 py-1 rounded-full border text-slate-500 border-slate-700">{b}</span>
              ))}
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}
