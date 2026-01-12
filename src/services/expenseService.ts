import {
  collection,
  addDoc,
  getDocs,
  query,
  where,
  orderBy,
  Timestamp,
} from 'firebase/firestore';
import { db } from './firebase';
import { Expense } from '../types';

export async function addExpense(
  data: Omit<Expense, 'id' | 'createdAt'>
): Promise<string> {
  const docRef = await addDoc(collection(db, 'expenses'), {
    ...data,
    createdAt: new Date(),
  });
  return docRef.id;
}

export async function getApartmentExpenses(
  apartmentId: string,
  fromDate?: string,
  toDate?: string
): Promise<Expense[]> {
  let q = query(
    collection(db, 'expenses'),
    where('apartmentId', '==', apartmentId),
    orderBy('date', 'desc')
  );

  if (fromDate || toDate) {
    const constraints = [where('apartmentId', '==', apartmentId)];
    if (fromDate) {
      constraints.push(where('date', '>=', fromDate));
    }
    if (toDate) {
      constraints.push(where('date', '<=', toDate));
    }
    q = query(collection(db, 'expenses'), ...constraints, orderBy('date', 'desc'));
  }

  const snap = await getDocs(q);
  return snap.docs.map(
    (d) =>
      ({
        id: d.id,
        ...d.data(),
        createdAt: d.data().createdAt?.toDate?.() ?? new Date(),
      } as Expense)
  );
}
