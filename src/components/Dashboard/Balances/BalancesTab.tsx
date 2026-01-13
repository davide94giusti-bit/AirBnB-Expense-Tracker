import { useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';

interface Balance {
  id: string;
  person: string;
  amount: number;
  description: string;
  date: string;
  type: 'owes' | 'owed';
}

export default function BalancesTab({ apartmentId }: { apartmentId: string }) {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({
    person: '',
    amount: '',
    description: '',
    date: new Date().toISOString().split('T')[0],
    type: 'owes' as const,
  });

  const handleAddBalance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.person || !formData.amount) return;

    const newBalance: Balance = {
      id: Date.now().toString(),
      person: formData.person,
      amount: parseFloat(formData.amount),
      description: formData.description,
      date: formData.date,
      type: formData.type,
    };

    setBalances([...balances, newBalance]);
    setFormData({
      person: '',
      amount: '',
      description: '',
      date: new Date().toISOString().split('T')[0],
      type: 'owes',
    });
    setShowForm(false);
  };

  const handleDeleteBalance = (id: string) => {
    if (confirm('Delete this record?')) {
      setBalances(balances.filter((b) => b.id !== id));
    }
  };

  const totalOwes = balances
    .filter((b) => b.type === 'owes')
    .reduce((sum, b) => sum + b.amount, 0);

  const totalOwed = balances
    .filter((b) => b.type === 'owed')
    .reduce((sum, b) => sum + b.amount, 0);

  const netBalance = totalOwed - totalOwes;

  return (
    <div className="max-w-4xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold">Balances</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-orange-600 hover:bg-orange-700 text-white font-semibold px-4 py-2 rounded-lg transition"
        >
          <Plus size={20} />
          Add Balance
        </button>
      </div>

      {showForm && (
        <form
          onSubmit={handleAddBalance}
          className="bg-slate-900 border border-slate-700 rounded-lg p-6 mb-6"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
              <label className="block text-sm font-medium mb-2">Person</label>
              <input
                type="text"
                placeholder="Name"
                value={formData.person}
                onChange={(e) => setFormData({ ...formData, person: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Type</label>
              <select
                value={formData.type}
                onChange={(e) => setFormData({ ...formData, type: e.target.value as 'owes' | 'owed' })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              >
                <option value="owes">I Owe</option>
                <option value="owed">Owed to Me</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <div>
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
            <div>
              <label className="block text-sm font-medium mb-2">Date</label>
              <input
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
              />
            </div>
          </div>

          <div className="mb-6">
            <label className="block text-sm font-medium mb-2">Description</label>
            <input
              type="text"
              placeholder="What is this for?"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800 border border-slate-600 rounded-lg px-3 py-2 text-slate-100"
            />
          </div>

          <div className="flex gap-3">
            <button
              type="submit"
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white font-semibold py-2 rounded-lg transition"
            >
              Add Balance
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

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
          <p className="text-sm text-slate-400 mb-1">I Owe</p>
          <p className="text-2xl font-bold text-red-400">€{totalOwes.toFixed(2)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
          <p className="text-sm text-slate-400 mb-1">Owed to Me</p>
          <p className="text-2xl font-bold text-green-400">€{totalOwed.toFixed(2)}</p>
        </div>
        <div className="bg-slate-900 border border-slate-700 rounded-lg p-4">
          <p className="text-sm text-slate-400 mb-1">Net Balance</p>
          <p className={`text-2xl font-bold ${netBalance >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
            €{netBalance.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        {balances.length === 0 ? (
          <div className="text-center py-8 text-slate-400">No balances recorded</div>
        ) : (
          balances.map((balance) => (
            <div
              key={balance.id}
              className="bg-slate-900 border border-slate-700 rounded-lg p-4 flex items-center justify-between hover:border-slate-600 transition"
            >
              <div className="flex-1">
                <p className="font-semibold text-slate-100">{balance.person}</p>
                <p className="text-sm text-slate-400">{balance.description}</p>
                <p className="text-xs text-slate-500 mt-1">{balance.date}</p>
              </div>
              <div className="flex items-center gap-4">
                <div className="text-right">
                  <p className={`font-bold ${balance.type === 'owes' ? 'text-red-400' : 'text-green-400'}`}>
                    {balance.type === 'owes' ? '-' : '+'}€{balance.amount.toFixed(2)}
                  </p>
                  <p className="text-xs text-slate-400">
                    {balance.type === 'owes' ? 'I Owe' : 'Owed to Me'}
                  </p>
                </div>
                <button
                  onClick={() => handleDeleteBalance(balance.id)}
                  className="text-red-400 hover:text-red-300 transition"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
