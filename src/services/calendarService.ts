import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  writeBatch,
} from 'firebase/firestore';
import { db } from './firebase';
import { CalendarEvent } from '../types';

export async function setCalendarEvent(
  apartmentId: string,
  date: string,
  status: 'occupied' | 'maintenance' | 'cleaning' | 'free',
  notes: string,
  guests: string[] = []
): Promise<void> {
  const eventId = `${apartmentId}_${date}`;
  await setDoc(doc(db, 'calendarEvents', eventId), {
    id: eventId,
    apartmentId,
    date,
    status,
    notes,
    guests,
    createdAt: new Date(),
    updatedAt: new Date(),
  });
}

export async function getCalendarEvents(
  apartmentId: string,
  fromDate: string,
  toDate: string
): Promise<CalendarEvent[]> {
  const q = query(
    collection(db, 'calendarEvents'),
    where('apartmentId', '==', apartmentId),
    where('date', '>=', fromDate),
    where('date', '<=', toDate)
  );

  const snap = await getDocs(q);
  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
        updatedAt: d.data().updatedAt?.toDate?.() ?? new Date(),
      } as CalendarEvent)
  );
}

export async function occupyDatesForGuest(
  apartmentId: string,
  guestIds: string[],
  checkIn: string,
  checkOut: string
): Promise<void> {
  const batch = writeBatch(db);
  const start = new Date(checkIn);
  const end = new Date(checkOut);

  

  for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
    const iso = d.toISOString().split('T')[0];  // ✅ FIX: Get only the date part
    const eventId = `${apartmentId}_${iso}`;
    batch.set(doc(db, 'calendarEvents', eventId), {
      id: eventId,
      apartmentId,
      date: iso,
      status: 'occupied',
      notes: '',
      guests: guestIds,
      createdAt: new Date(),
      updatedAt: new Date(),
    });
  }

  await batch.commit();
}
