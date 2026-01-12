import { useState } from 'react';
import { useExpenses } from '../../hooks/useExpenses';
import { addExpense } from '../../services/expenseService';
import { compressImage } from '../../services/storageService';
import { format } from 'date-fns';
import { Upload, Trash2, Plus } from 'lucide-react';

export default function ExpensesTab({ apartmentId }: { apartmentId: string }) {
  const { expenses } = useExpenses(apartmentId);
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    type: 'other' as const,
    description: '',
    amount: '',
    date: format(new Date(), 'yyyy-MM-dd'),
    notes: '',
  });
  const [files, setFiles] = useState<File[]>([]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!formData.description || !formData.amount) {
      alert('Please fill required fields');
      return;
    }

    setLoading(true);
    try {
      const photoUrls: string[] = [];

      // Upload files
      for (const file of files) {
        const path = generateStoragePath(apartmentId, 'expense', Date.now().toString(), file.name);
        const url = await uploadFile(path, file);
        photoUrls.push(url);
      }

      // Add expense
      await addExpense({
        apartmentId,
        userId: 'user-uid-here', // Replace with actual user ID
        type: formData.type,
        description: formData.description,
        amount: parseFloat(formData.amount),
        currency: 'EUR',
        date: formData.date,
        notes: formData.notes,
        photoUrls,
      });

      // Reset form
      setFormData({
        type: 'other',
        description: '',
        amount: '',
        date: format(new Date(), 'yyyy-MM-dd'),
        notes: '',
      });
      setFiles([]);
      setShowForm(false);
    } catch (error) {
      alert('Error adding expense');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Expenses</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Add Expense
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium mb-1">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) =>
                    setFormData({ ...formData, type: e.target.value as any })
                  }
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
                >
                  <option value="other">Other</option>
                  <option value="maintenance">Maintenance</option>
                  <option value="cleaning">Cleaning</option>
                  <option value="utilities">Utilities</option>
                  <option value="tax">Tax</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Amount (€)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) =>
                    setFormData({ ...formData, amount: e.target.value })
                  }
                  className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Description</label>
              <input
                type="text"
                value={formData.description}
                onChange={(e) =>
                  setFormData({ ...formData, description: e.target.value })
                }
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
                placeholder="e.g., New bedsheets"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) =>
                  setFormData({ ...formData, date: e.target.value })
                }
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">Notes</label>
              <textarea
                value={formData.notes}
                onChange={(e) =>
                  setFormData({ ...formData, notes: e.target.value })
                }
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 h-20"
                placeholder="Additional notes..."
              />
            </div>

            {/* File upload */}
            <div>
              <label className="block text-sm font-medium mb-2">Receipt Photo</label>
              <div className="border-2 border-dashed border-slate-600 rounded-lg p-4 text-center">
                <Upload className="mx-auto mb-2 text-slate-400" size={20} />
                <input
                  type="file"
                  multiple
                  onChange={(e) => setFiles(Array.from(e.target.files || []))}
                  className="hidden"
                  id="file-input"
                  accept="image/*"
                />
                <label htmlFor="file-input" className="cursor-pointer">
                  <span className="text-slate-400">Click to upload photos</span>
                </label>
                {files.length > 0 && (
                  <div className="mt-2 text-sm text-emerald-400">
                    {files.length} file(s) selected
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2">
              <button
                type="submit"
                disabled={loading}
                className="flex-1 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-semibold py-2 rounded-lg transition"
              >
                {loading ? 'Saving...' : 'Save Expense'}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="flex-1 bg-slate-700 hover:bg-slate-600 text-slate-100 font-semibold py-2 rounded-lg transition"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Expenses list */}
      <div className="space-y-3">
        {expenses.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No expenses yet</div>
        ) : (
          expenses.map((exp) => (
            <div
              key={exp.id}
              className="bg-slate-900 border border-slate-700 rounded-lg p-4 hover:bg-slate-800/50 transition"
            >
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="font-semibold text-slate-200">{exp.description}</div>
                  <div className="text-xs text-slate-400">
                    {format(new Date(exp.date), 'MMM dd, yyyy')} · {exp.type}
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400">€{exp.amount.toFixed(2)}</div>
                </div>
              </div>
              {exp.notes && (
                <div className="text-sm text-slate-400 mb-2">{exp.notes}</div>
              )}
              {exp.photoUrls && exp.photoUrls.length > 0 && (
                <div className="flex gap-2 mt-2 overflow-x-auto">
                  {exp.photoUrls.map((url, idx) => (
                    <img
                      key={idx}
                      src={url}
                      alt={`Receipt ${idx}`}
                      className="w-20 h-20 object-cover rounded"
                    />
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
}
