import { useState } from 'react';
import { format } from 'date-fns';
import { Plus, Trash2 } from 'lucide-react';

interface Expense {
  id: string;
  date: string;
  description: string;
  type: string;
  amount: number;
}

export default function ExpensesTab({ apartmentId }: { apartmentId: string }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const today = new Date();
  
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    date: format(today, 'yyyy-MM-dd'),
    description: '',
    type: 'maintenance',
    amount: '',
  });

  const handleAddExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    const newExpense: Expense = {
      id: Date.now().toString(),
      date: formData.date,
      description: formData.description,
      type: formData.type,
      amount: parseFloat(formData.amount),
    };

    setExpenses([...expenses, newExpense]);
    setFormData({
      date: format(today, 'yyyy-MM-dd'),
      description: '',
      type: 'maintenance',
      amount: '',
    });
    setShowForm(false);
  };

  const handleDeleteExpense = (id: string) => {
    if (confirm('Delete this expense?')) {
      setExpenses(expenses.filter((exp) => exp.id !== id));
    }
  };

  const total = expenses.reduce((sum, exp) => sum + exp.amount, 0);

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Expenses</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddExpense}
          className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="maintenance">Maintenance</option>
                <option value="cleaning">Cleaning</option>
                <option value="utilities">Utilities</option>
                <option value="supplies">Supplies</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Description</label>
            <input
              type="text"
              placeholder="e.g., Paint walls"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
            />
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Amount (€)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0.00"
              value={formData.amount}
              onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Add Expense
            </button>
            <button
              type="button"
              onClick={() => setShowForm(false)}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-slate-100 font-semibold py-2 rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </form>
      )}

      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700">
              <th className="text-left py-3 px-4">Date</th>
              <th className="text-left py-3 px-4">Description</th>
              <th className="text-left py-3 px-4">Type</th>
              <th className="text-right py-3 px-4">Amount</th>
              <th className="text-center py-3 px-4">Action</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan={5} className="text-center py-8 text-slate-400">
                  No expenses yet
                </td>
              </tr>
            ) : (
              expenses.map((exp) => (
                <tr key={exp.id} className="border-b border-slate-800 hover:bg-slate-800/50">
                  <td className="py-3 px-4">{format(new Date(exp.date), 'MMM dd')}</td>
                  <td className="py-3 px-4">{exp.description}</td>
                  <td className="py-3 px-4 capitalize">
                    <span className="bg-slate-700 px-2 py-1 rounded text-xs">{exp.type}</span>
                  </td>
                  <td className="text-right py-3 px-4 font-semibold text-emerald-400">
                    €{exp.amount.toFixed(2)}
                  </td>
                  <td className="text-center py-3 px-4">
                    <button
                      onClick={() => handleDeleteExpense(exp.id)}
                      className="text-red-400 hover:text-red-300 transition"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {expenses.length > 0 && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
          <div className="flex justify-between items-center">
            <span className="text-lg font-bold">Total:</span>
            <span className="text-2xl font-bold text-emerald-400">€{total.toFixed(2)}</span>
          </div>
        </div>
      )}
    </div>
  );
}
