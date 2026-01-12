import {
  collection,
  doc,
  setDoc,
  getDoc,
  getDocs,
  query,
  where,
  addDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { Apartment } from '../types';

export async function createApartment(
  data: Omit<Apartment, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'apartments'), {
    ...data,
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function getApartment(id: string): Promise<Apartment | null> {
  const docSnap = await getDoc(doc(db, 'apartments', id));
  if (!docSnap.exists()) return null;
  return {
    id: docSnap.id,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate?.() ?? new Date(),
  } as Apartment;
}

export async function getUserApartments(uid: string): Promise<Apartment[]> {
  const q = query(
    collection(db, 'apartments'),
    where('owners', 'array-contains', uid)
  );
  const querySnapshot = await getDocs(q);
  return querySnapshot.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
      } as Apartment)
  );
}

export async function updateApartment(
  id: string,
  data: Partial<Apartment>
): Promise<void> {
  await updateDoc(doc(db, 'apartments', id), data);
}
