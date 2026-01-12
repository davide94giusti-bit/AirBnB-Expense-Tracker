import Sidebar from './Sidebar';
import MobileTabBar from './MobileTabBar';
import { Outlet } from 'react-router-dom';

export default function DashboardLayout() {
  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      <Sidebar />
      <main className="flex-1 md:ml-64 overflow-y-auto pb-20 md:pb-0">
        <div className="p-4 sm:p-6">
          <Outlet />
        </div>
      </main>
      <MobileTabBar />
    </div>
  );
}
