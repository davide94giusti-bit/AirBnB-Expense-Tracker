import { useEffect, useState } from 'react';
import { collection, query, where, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { CalendarEvent } from '../types';

export function useCalendarEvents(
  apartmentId: string,
  monthStart: string,
  monthEnd: string
) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!apartmentId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const q = query(
      collection(db, 'calendarEvents'),
      where('apartmentId', '==', apartmentId),
      where('date', '>=', monthStart),
      where('date', '<=', monthEnd)
    );

    const unsub = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(
        (d) =>
          ({
            id: d.id,
            ...d.data(),
            createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
            updatedAt: d.data().updatedAt?.toDate?.() ?? new Date(),
          } as CalendarEvent)
      );
      setEvents(data);
      setLoading(false);
    });

    return unsub;
  }, [apartmentId, monthStart, monthEnd]);

  return { events, loading };
}
