import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  deleteDoc,
  doc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Guest } from '../types';

export async function addGuest(data: Omit<Guest, 'id' | 'createdAt'>) {
  const docRef = await addDoc(collection(db, 'guests'), {
    ...data,
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function getApartmentGuests(apartmentId: string): Promise<Guest[]> {
  const q = query(collection(db, 'guests'), where('apartmentId', '==', apartmentId));
  const snap = await getDocs(q);
  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
      } as Guest)
  );
}

export async function deleteGuest(id: string): Promise<void> {
  await deleteDoc(doc(db, 'guests', id));
}
