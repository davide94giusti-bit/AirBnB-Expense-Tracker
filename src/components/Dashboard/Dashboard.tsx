import { useState } from 'react';
import { signOut } from 'firebase/auth';
import { auth } from '../../services/firebase';
import { useNavigate } from 'react-router-dom';
import { LogOut, Calendar, DollarSign, Users, BarChart3 } from 'lucide-react';
import CalendarTab from '../Calendar/CalendarTab';
import ExpensesTab from '../Expenses/ExpensesTab';
import GuestsTab from '../Guests/GuestsTab';
import BalancesTab from '../Balances/BalancesTab';

export default function Dashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('calendar');

  async function handleLogout() {
    try {
      await signOut(auth);
      navigate('/login');
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-emerald-400">AirBnB Control</h1>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition"
          >
            <LogOut size={18} />
            Logout
          </button>
        </div>
      </header>

      {/* Tabs Navigation */}
      <div className="bg-slate-900 border-b border-slate-700">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('calendar')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                activeTab === 'calendar'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <Calendar size={18} />
              Calendar
            </button>
            <button
              onClick={() => setActiveTab('expenses')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                activeTab === 'expenses'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <DollarSign size={18} />
              Expenses
            </button>
            <button
              onClick={() => setActiveTab('guests')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                activeTab === 'guests'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <Users size={18} />
              Guests
            </button>
            <button
              onClick={() => setActiveTab('balances')}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 transition ${
                activeTab === 'balances'
                  ? 'border-emerald-500 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-300'
              }`}
            >
              <BarChart3 size={18} />
              Balances
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {activeTab === 'calendar' && <CalendarTab />}
        {activeTab === 'expenses' && <ExpensesTab />}
        {activeTab === 'guests' && <GuestsTab />}
        {activeTab === 'balances' && <BalancesTab />}
      </main>
    </div>
  );
}
