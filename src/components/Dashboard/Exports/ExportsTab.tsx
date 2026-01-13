import { useState } from 'react';
import { format, subMonths, addMonths, startOfMonth, endOfMonth } from 'date-fns';
import { Download } from 'lucide-react';
import html2canvas from 'html2canvas';

export default function ExportsTab({ apartmentId }: { apartmentId: string }) {
  const [reportType, setReportType] = useState('expenses');
  const [range, setRange] = useState('current');
  const today = new Date();

  const getRangeDates = (range: string) => {
    const currentStart = startOfMonth(today);
    const currentEnd = endOfMonth(today);

    switch (range) {
      case 'current':
        return {
          from: format(currentStart, 'yyyy-MM-dd'),
          to: format(currentEnd, 'yyyy-MM-dd'),
        };
      case '3months':
        return {
          from: format(subMonths(today, 3), 'yyyy-MM-dd'),
          to: format(currentEnd, 'yyyy-MM-dd'),
        };
      case '6months':
        return {
          from: format(subMonths(today, 6), 'yyyy-MM-dd'),
          to: format(currentEnd, 'yyyy-MM-dd'),
        };
      default:
        return {
          from: format(currentStart, 'yyyy-MM-dd'),
          to: format(currentEnd, 'yyyy-MM-dd'),
        };
    }
  };

  const { from, to } = getRangeDates(range);

  async function exportAsScreenshot() {
    const element = document.getElementById('report-content');
    if (!element) return;

    try {
      const canvas = await html2canvas(element, {
        backgroundColor: '#030712',
        scale: 2,
      });
      const link = document.createElement('a');
      link.href = canvas.toDataURL('image/png');
      link.download = `airbnb-${reportType}-${format(today, 'yyyy-MM-dd')}.png`;
      link.click();
    } catch (error) {
      alert('Error exporting report');
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Exports</h2>
        <button
          onClick={exportAsScreenshot}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition"
        >
          <Download size={20} />
          Export as Image
        </button>
      </div>

      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Report Type</label>
          <select
            value={reportType}
            onChange={(e) => setReportType(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 w-full text-slate-100"
          >
            <option value="expenses">Expenses Report</option>
            <option value="summary">Summary Report</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Time Range</label>
          <select
            value={range}
            onChange={(e) => setRange(e.target.value)}
            className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 w-full text-slate-100"
          >
            <option value="current">Current Month</option>
            <option value="3months">Last 3 Months</option>
            <option value="6months">Last 6 Months</option>
          </select>
        </div>
      </div>

      <div
        id="report-content"
        className="bg-slate-900 border border-slate-700 rounded-lg p-6"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-1 capitalize">
            {reportType === 'expenses' ? 'Expense' : 'Summary'} Report
          </h3>
          <p className="text-sm text-slate-400">
            {format(new Date(from), 'MMM dd, yyyy')} to {format(new Date(to), 'MMM dd, yyyy')}
          </p>
        </div>

        <div className="bg-slate-800 rounded-lg p-4">
          <p className="text-slate-300">
            Report for apartment: <span className="font-semibold">{apartmentId || 'N/A'}</span>
          </p>
          <p className="text-slate-300 mt-2">
            Generated: <span className="font-semibold">{format(today, 'MMMM dd, yyyy')}</span>
          </p>
        </div>
      </div>
    </div>
  );
}
