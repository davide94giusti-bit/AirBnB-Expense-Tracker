import { Calendar, DollarSign, Users, BarChart3, Download, Settings, LogOut } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { logout } from '../../services/authService';
import { useCurrentUser } from '../../hooks/useCurrentUser';
import { useState } from 'react';

export default function MobileTabBar() {
  const location = useLocation();
  const { userProfile } = useCurrentUser();
  const isSuperAdmin = userProfile?.role === 'superAdmin';
  const [showMenu, setShowMenu] = useState(false);

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

  async function handleLogout() {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  }

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 bg-slate-900 border-t border-slate-700">
      <div className="flex justify-around items-center overflow-x-auto">
        {navItems.map(({ path, label, icon: Icon }) => {
          const active = location.pathname === path;
          return (
            <Link
              key={path}
              to={path}
              className={`flex flex-col items-center justify-center gap-1 py-3 px-4 text-xs transition ${
                active ? 'text-emerald-400 border-t-2 border-emerald-400' : 'text-slate-400'
              }`}
            >
              <Icon size={20} />
              <span>{label}</span>
            </Link>
          );
        })}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className="flex flex-col items-center justify-center gap-1 py-3 px-4 text-xs text-slate-400"
        >
          <LogOut size={20} />
          <span>Menu</span>
        </button>
      </div>
      {showMenu && (
        <div className="bg-slate-800 p-4 text-sm space-y-2">
          <button
            onClick={handleLogout}
            className="w-full text-left text-red-400 hover:text-red-300"
          >
            Logout
          </button>
        </div>
      )}
    </div>
  );
}
