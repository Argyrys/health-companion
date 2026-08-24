import { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Activity, Users, LayoutDashboard, LogOut, Menu, X } from 'lucide-react';

export default function Navbar({ doctorName, doctorNum, onLogout }) {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const links = [
    { path: '/', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/patients', label: 'Patients', icon: Users },
  ];

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="bg-white/80 backdrop-blur-xl border-b border-slate-200/60 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14 sm:h-16">
          <div className="flex items-center gap-8">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:shadow-emerald-500/40 transition-shadow">
                <Activity className="w-5 h-5 text-white" />
              </div>
              <div className="hidden sm:block">
                <span className="text-base font-bold text-slate-800 tracking-tight">AI Health Companion</span>
              </div>
            </Link>

            <div className="hidden md:flex items-center gap-1 bg-slate-100/80 rounded-xl p-1">
              {links.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-white text-emerald-700 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 hover:bg-white/50'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {label}
                </Link>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-3">
            <div className="hidden sm:flex items-center gap-2.5 pl-3 border-l border-slate-200">
              <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
                <span className="text-white font-semibold text-sm">
                  {doctorName.charAt(0)}
                </span>
              </div>
              <div className="text-right">
                <p className="text-sm font-semibold text-slate-800 leading-tight">Dr. {doctorName}</p>
                <p className="text-[10px] text-slate-400">ID #{doctorNum || '...'}</p>
              </div>
            </div>

            <button
              onClick={onLogout}
              className="flex items-center gap-2 px-3 py-2 text-sm font-medium text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Logout</span>
            </button>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-xl transition-colors relative"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {mobileOpen && (
        <>
          <div className="md:hidden fixed inset-0 top-16 bg-black/10 backdrop-blur-sm z-40" onClick={() => setMobileOpen(false)} />
          <div className="md:hidden border-t border-slate-100 bg-white/95 backdrop-blur-xl animate-slideIn relative z-50">
            <div className="px-4 py-3 space-y-1">
              {links.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  onClick={() => setMobileOpen(false)}
                  className={`flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    isActive(path)
                      ? 'bg-emerald-50 text-emerald-700 shadow-sm'
                      : 'text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  {label}
                </Link>
              ))}
              <div className="flex items-center gap-3 px-4 py-3 border-t border-slate-100 mt-2 pt-3">
                <div className="w-9 h-9 bg-gradient-to-br from-emerald-400 to-teal-500 rounded-full flex items-center justify-center shadow-sm">
                  <span className="text-white font-semibold text-sm">{doctorName.charAt(0)}</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-semibold text-slate-800">Dr. {doctorName}</p>
                  <p className="text-[10px] text-slate-400">ID #{doctorNum || '...'}</p>
                </div>
                <button
                  onClick={() => { setMobileOpen(false); onLogout(); }}
                  className="text-sm text-red-500 hover:text-red-600 font-medium"
                >
                  Logout
                </button>
              </div>
            </div>
          </div>
        </>
      )}
    </nav>
  );
}
