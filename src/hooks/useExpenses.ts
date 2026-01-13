import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export interface Expense {
  id: string;
  date: string;
  description: string;
  type: string;
  amount: number;
}

export function useExpenses(apartmentId: string, from: string, to: string) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchExpenses = async () => {
      if (!apartmentId) {
        setLoading(false);
        return;
      }

      try {
        const expensesRef = collection(db, 'apartments', apartmentId, 'expenses');
        const q = query(
          expensesRef,
          where('date', '>=', from),
          where('date', '<=', to)
        );
        const querySnapshot = await getDocs(q);
        const expensesList: Expense[] = [];

        querySnapshot.forEach((doc) => {
          expensesList.push({
            id: doc.id,
            ...doc.data(),
          } as Expense);
        });

        setExpenses(expensesList);
      } catch (error) {
        console.error('Error fetching expenses:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchExpenses();
  }, [apartmentId, from, to]);

  return { expenses, loading };
}
