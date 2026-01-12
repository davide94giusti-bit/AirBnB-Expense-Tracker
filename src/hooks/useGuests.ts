import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { Guest } from '../types';

export function useGuests(apartmentId: string) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apartmentId) {
      setGuests([]);
      setLoading(false);
      return;
    }

    const q = query(collection(db, 'guests'), where('apartmentId', '==', apartmentId));

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (d) =>
          ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
          } as Guest)
      );
      setGuests(data);
      setLoading(false);
    });

    return unsub;
  }, [apartmentId]);

  return { guests, loading };
}
