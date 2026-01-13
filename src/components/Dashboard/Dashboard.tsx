import { useState } from 'react';
import UsersTab from './Users/UsersTab';
import { useParams, useNavigate } from 'react-router-dom';
import InitializeApartment from './InitializeApartment';
import ExportsTab from './Exports/ExportsTab';
import ExpensesTab from './Expenses/ExpensesTab';
import BalancesTab from './Balances/BalancesTab';
import CalendarTab from './Calendar/CalendarTab';
import GuestsTab from './Guests/GuestsTab';
import { BarChart3, Calendar, Users, DollarSign, FileText, Home, Lock } from 'lucide-react';


interface TabConfig {
  id: string;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
}


export default function Dashboard() {
  const { apartmentId } = useParams<{ apartmentId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState('expenses');
  const [isInitialized, setIsInitialized] = useState(false);


  if (!apartmentId) {
    return <div>Loading...</div>;
  }


  // Show initialization screen first
  if (!isInitialized) {
    return (
      <InitializeApartment
        apartmentId={apartmentId}
        onSuccess={() => {
          setIsInitialized(true);
        }}
      />
    );
  }


  const tabs: TabConfig[] = [
    {
      id: 'expenses',
      label: 'Expenses',
      icon: <DollarSign size={20} />,
      component: <ExpensesTab apartmentId={apartmentId} />,
    },
    {
      id: 'calendar',
      label: 'Calendar',
      icon: <Calendar size={20} />,
      component: <CalendarTab apartmentId={apartmentId} />,
    },
    {
      id: 'guests',
      label: 'Guests',
      icon: <Users size={20} />,
      component: <GuestsTab apartmentId={apartmentId} />,
    },
    {
      id: 'balances',
      label: 'Balances',
      icon: <BarChart3 size={20} />,
      component: <BalancesTab apartmentId={apartmentId} />,
    },
    {
      id: 'exports',
      label: 'Exports',
      icon: <FileText size={20} />,
      component: <ExportsTab apartmentId={apartmentId} />,
    },
    {
      id: 'users',
      label: 'Users',
      icon: <Lock size={20} />,
      component: <UsersTab apartmentId={apartmentId} />,
    },
  ];


  return (
    <div className="min-h-screen bg-slate-950">
      {/* Header */}
      <header className="bg-slate-900 border-b border-slate-700 py-4 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 flex items-center justify-between">
          <button
            onClick={() => navigate('/apartments')}
            className="flex items-center gap-2 text-slate-400 hover:text-slate-200 transition"
          >
            <Home size={20} />
            <span className="text-sm">Back</span>
          </button>
          <h1 className="text-2xl font-bold text-emerald-400">AirBnB Control</h1>
          <div className="w-20" />
        </div>
      </header>


      {/* Tabs Navigation */}
      <div className="bg-slate-900 border-b border-slate-700 overflow-x-auto">
        <div className="max-w-7xl mx-auto px-4 flex gap-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 transition border-b-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'border-emerald-400 text-emerald-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              {tab.icon}
              {tab.label}
            </button>
          ))}
        </div>
      </div>


      {/* Tab Content */}
      <main className="max-w-7xl mx-auto px-4 py-8">
        {tabs.find((tab) => tab.id === activeTab)?.component}
      </main>
    </div>
  );
}