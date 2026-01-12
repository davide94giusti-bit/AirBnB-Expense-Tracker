import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  User as FirebaseUser,
} from 'firebase/auth';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { auth, db } from './firebase';
import { User } from '../types';

export async function registerUser(
  email: string,
  password: string,
  options?: { displayName?: string; role?: 'manager' | 'viewer' }
): Promise<FirebaseUser> {
  const cred = await createUserWithEmailAndPassword(auth, email, password);
  const user = cred.user;

  const role = options?.role ?? 'manager';
  const displayName = options?.displayName ?? email.split('@');

  await setDoc(doc(db, 'users', user.uid), {
    email,
    displayName,
    role,
    apartments: [],
    createdAt: new Date(),
  });

  return user;
}

export async function login(
  email: string,
  password: string
): Promise<FirebaseUser> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export function logout(): Promise<void> {
  return signOut(auth);
}

export async function getCurrentUserProfile(uid: string): Promise<User | null> {
  const docSnap = await getDoc(doc(db, 'users', uid));
  if (!docSnap.exists()) return null;
  return {
    uid,
    ...docSnap.data(),
    createdAt: docSnap.data().createdAt?.toDate?.() ?? new Date(),
  } as User;
}

export async function updateUserApartments(
  uid: string,
  apartmentIds: string[]
): Promise<void> {
  await setDoc(
    doc(db, 'users', uid),
    { apartments: apartmentIds },
    { merge: true }
  );
}
