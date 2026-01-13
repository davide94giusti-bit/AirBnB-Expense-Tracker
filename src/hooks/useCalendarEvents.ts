import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, query, where, getDocs } from 'firebase/firestore';

export interface CalendarEvent {
  id: string;
  date: string;
  status: string;
  notes: string;
}

export function useCalendarEvents(apartmentId: string, from: string, to: string) {
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEvents = async () => {
      if (!apartmentId) {
        setLoading(false);
        return;
      }

      try {
        const eventsRef = collection(db, 'apartments', apartmentId, 'calendarEvents');
        const q = query(
          eventsRef,
          where('date', '>=', from),
          where('date', '<=', to)
        );
        const querySnapshot = await getDocs(q);
        const eventsList: CalendarEvent[] = [];

        querySnapshot.forEach((doc) => {
          eventsList.push({
            id: doc.id,
            ...doc.data(),
          } as CalendarEvent);
        });

        setEvents(eventsList);
      } catch (error) {
        console.error('Error fetching calendar events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [apartmentId, from, to]);

  return { events, loading };
}
