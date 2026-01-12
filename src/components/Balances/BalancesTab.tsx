import { useEffect, useState } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db, auth } from '../../services/firebase';
import { TrendingUp, TrendingDown } from 'lucide-react';

interface Balance {
  userId: string;
  displayName: string;
  net: number;
}

export default function BalancesTab() {
  const [balances, setBalances] = useState<Balance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadBalances();
  }, []);

  async function loadBalances() {
    try {
      setLoading(true);
      setError(null);

      const user = auth.currentUser;
      if (!user) {
        setError('Not logged in');
        return;
      }

      // Get all expenses
      const expensesRef = collection(db, 'expenses');
      const expensesSnapshot = await getDocs(expensesRef);

      // Get all payments
      const paymentsRef = collection(db, 'payments');
      const paymentsSnapshot = await getDocs(paymentsRef);

      // Get all users
      const usersRef = collection(db, 'users');
      const usersSnapshot = await getDocs(usersRef);

      // Create a map of user IDs to names
      const userMap: Record<string, string> = {};
      usersSnapshot.docs.forEach((doc) => {
        userMap[doc.id] = doc.data().displayName || doc.data().email || doc.id;
      });

      // Calculate balances
      const balanceMap: Record<string, number> = {};

      // Initialize balances for all users
      Object.keys(userMap).forEach((userId) => {
        balanceMap[userId] = 0;
      });

      // Add expenses (divide by number of users)
      expensesSnapshot.docs.forEach((doc) => {
        const expense = doc.data();
        const amount = expense.amount || 0;
        const userId = expense.userId;
        const userCount = Object.keys(userMap).length || 1;

        // The person who paid gets credit
        balanceMap[userId] = (balanceMap[userId] || 0) + amount;

        // All users owe a share
        Object.keys(userMap).forEach((u) => {
          if (u !== userId) {
            balanceMap[u] = (balanceMap[u] || 0) - (amount / userCount);
          }
        });
      });

      // Add payments
      paymentsSnapshot.docs.forEach((doc) => {
        const payment = doc.data();
        const amount = payment.amount || 0;
        const fromUserId = payment.fromUserId;
        const toUserId = payment.toUserId;

        balanceMap[fromUserId] = (balanceMap[fromUserId] || 0) - amount;
        balanceMap[toUserId] = (balanceMap[toUserId] || 0) + amount;
      });

      // Convert to array and sort
      const balancesArray = Object.entries(balanceMap)
        .map(([userId, net]) => ({
          userId,
          displayName: userMap[userId] || userId,
          net: Math.round(net * 100) / 100,
        }))
        .sort((a, b) => b.net - a.net);

      setBalances(balancesArray);
    } catch (err: any) {
      console.error('Error loading balances:', err);
      setError(err.message || 'Failed to load balances');
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <p className="text-slate-400">Loading balances...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-100 mb-4">Balances</h2>
        <p className="text-slate-400">Current financial status between co-owners</p>
      </div>

      {error && (
        <div className="bg-red-900/30 border border-red-700 rounded-lg p-4 text-red-300">
          {error}
        </div>
      )}

      {balances.length === 0 ? (
        <div className="bg-slate-800 rounded-lg p-8 text-center">
          <p className="text-slate-400">No transactions yet</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {balances.map((balance) => (
            <div
              key={balance.userId}
              className="bg-slate-800 border border-slate-700 rounded-lg p-4"
            >
              <p className="text-slate-300 font-medium mb-2">{balance.displayName}</p>
              <div className="flex items-center gap-2">
                {balance.net > 0 ? (
                  <>
                    <TrendingUp className="text-emerald-400" size={20} />
                    <span className="text-lg font-bold text-emerald-400">
                      +${balance.net.toFixed(2)}
                    </span>
                  </>
                ) : balance.net < 0 ? (
                  <>
                    <TrendingDown className="text-red-400" size={20} />
                    <span className="text-lg font-bold text-red-400">
                      ${balance.net.toFixed(2)}
                    </span>
                  </>
                ) : (
                  <span className="text-lg font-bold text-slate-400">$0.00</span>
                )}
              </div>
              <p className="text-xs text-slate-500 mt-2">
                {balance.net > 0
                  ? 'is owed money'
                  : balance.net < 0
                  ? 'owes money'
                  : 'is settled'}
              </p>
            </div>
          ))}
        </div>
      )}

      <button
        onClick={loadBalances}
        className="mt-6 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg transition"
      >
        Refresh Balances
      </button>
    </div>
  );
}
