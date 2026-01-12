import { useState } from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { format, subMonths } from 'date-fns';
import html2canvas from 'html2canvas';
import { Download } from 'lucide-react';

export default function ExportsTab({ apartmentId }: { apartmentId: string }) {
  const [range, setRange] = useState('current');
  const today = new Date();
  
  const getRangeDates = (range: string) => {
    switch (range) {
      case 'current':
        return {
          from: format(new Date(today.getFullYear(), today.getMonth(), 1), 'yyyy-MM-dd'),
          to: format(today, 'yyyy-MM-dd'),
        };
      case '3months':
        return {
          from: format(subMonths(today, 3), 'yyyy-MM-dd'),
          to: format(today, 'yyyy-MM-dd'),
        };
      case '6months':
        return {
          from: format(subMonths(today, 6), 'yyyy-MM-dd'),
          to: format(today, 'yyyy-MM-dd'),
        };
      case '12months':
        return {
          from: format(subMonths(today, 12), 'yyyy-MM-dd'),
          to: format(today, 'yyyy-MM-dd'),
        };
      default:
        return { from: '', to: '' };
    }
  };

  const { from, to } = getRangeDates(range);
  const { expenses } = useExpenses(apartmentId, from, to);

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

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
      link.download = `airbnb-report-${format(today, 'yyyy-MM-dd')}.png`;
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

      {/* Range selector */}
      <div className="mb-6 space-y-2">
        <label className="block text-sm font-medium">Time Range</label>
        <select
          value={range}
          onChange={(e) => setRange(e.target.value)}
          className="bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 w-full sm:w-64"
        >
          <option value="current">Current Month</option>
          <option value="3months">Last 3 Months</option>
          <option value="6months">Last 6 Months</option>
          <option value="12months">Last 12 Months</option>
        </select>
      </div>

      {/* Report */}
      <div
        id="report-content"
        className="bg-slate-900 border border-slate-700 rounded-lg p-6"
      >
        <div className="mb-6">
          <h3 className="text-xl font-bold mb-1">Expense Report</h3>
          <p className="text-sm text-slate-400">
            {format(new Date(from), 'MMM dd, yyyy')} to {format(new Date(to), 'MMM dd, yyyy')}
          </p>
        </div>

        {/* Table */}
        <table className="w-full mb-6 text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-2 px-2">Date</th>
              <th className="text-left py-2 px-2">Description</th>
              <th className="text-left py-2 px-2">Type</th>
              <th className="text-right py-2 px-2">Amount</th>
            </tr>
          </thead>
          <tbody>
            {expenses.map((exp) => (
              <tr key={exp.id} className="border-b border-slate-800">
                <td className="py-2 px-2">
                  {format(new Date(exp.date), 'MMM dd')}
                </td>
                <td className="py-2 px-2">{exp.description}</td>
                <td className="py-2 px-2 capitalize">{exp.type}</td>
                <td className="text-right py-2 px-2">€{exp.amount.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="bg-slate-800 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Total Expenses:</span>
            <span className="text-2xl font-bold text-emerald-400">
              €{total.toFixed(2)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
