import { useEffect, useState } from 'react';
import { collection, query, where, orderBy, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Expense } from '../types';

export function useExpenses(
  apartmentId: string,
  fromDate?: string,
  toDate?: string
) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apartmentId) {
      setExpenses([]);
      setLoading(false);
      return;
    }

    const constraints = [
      where('apartmentId', '==', apartmentId),
      orderBy('date', 'desc'),
    ];

    if (fromDate) {
      constraints.push(where('date', '>=', fromDate) as any);
    }
    if (toDate) {
      constraints.push(where('date', '<=', toDate) as any);
    }

    const q = query(collection(db, 'expenses'), ...constraints);

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (d) =>
          ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
          } as Expense)
      );
      setExpenses(data);
      setLoading(false);
    });

    return unsub;
  }, [apartmentId, fromDate, toDate]);

  return { expenses, loading };
}
