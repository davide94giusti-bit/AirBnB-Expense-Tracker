import { useState, useEffect } from 'react';
import { db } from '../services/firebase';
import { collection, getDocs } from 'firebase/firestore';

export interface Guest {
  id: string;
  name: string;
  email: string;
  phone: string;
  checkIn: string;
  checkOut: string;
  notes: string;
}

export function useGuests(apartmentId: string) {
  const [guests, setGuests] = useState<Guest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchGuests = async () => {
      if (!apartmentId) {
        setLoading(false);
        return;
      }

      try {
        const guestsRef = collection(db, 'apartments', apartmentId, 'guests');
        const querySnapshot = await getDocs(guestsRef);
        const guestsList: Guest[] = [];

        querySnapshot.forEach((doc) => {
          guestsList.push({
            id: doc.id,
            ...doc.data(),
          } as Guest);
        });

        setGuests(guestsList);
      } catch (error) {
        console.error('Error fetching guests:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchGuests();
  }, [apartmentId]);

  return { guests, loading };
}
