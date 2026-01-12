import { LogOut, Home, Calendar, Users, DollarSign, BarChart3, Download, Settings } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { logout } from '../../services/authService';
import { useCurrentUser } from '../../hooks/useCurrentUser';

export default function Sidebar() {
  const location = useLocation();
  const { userProfile } = useCurrentUser();
  const isSuperAdmin = userProfile?.role === 'superAdmin';

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  const navItems = [
    { path: '/dashboard', label: 'Calendar', icon: Calendar },
    { path: '/expenses', label: 'Expenses', icon: DollarSign },
    { path: '/guests', label: 'Guests', icon: Users },
    { path: '/balances', label: 'Balances', icon: BarChart3 },
    { path: '/exports', label: 'Exports', icon: Download },
  ];

  if (isSuperAdmin) {
    navItems.push({ path: '/admin', label: 'Admin', icon: Settings });
  }

  return (
    <div className="hidden md:flex flex-col w-64 bg-slate-900 border-r border-slate-700 h-screen fixed left-0 top-0">
      {/* Header */}
      <div className="p-6 border-b border-slate-700">
        <div className="flex items-center gap-2 mb-1">
          <Home size={24} className="text-emerald-400" />
          <h1 className="text-xl font-bold text-emerald-400">AirBnB</h1>
        </div>
        <p className="text-xs text-slate-400">{userProfile?.displayName}</p>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex items-center gap-3 px-4 py-2 rounded-lg transition ${
                active
                  ? 'bg-emerald-500/20 text-emerald-400 border-l-2 border-emerald-400'
                  : 'text-slate-400 hover:bg-slate-800'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="p-4 border-t border-slate-700">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-4 py-2 text-slate-400 hover:text-red-400 hover:bg-slate-800 rounded-lg transition"
        >
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}
