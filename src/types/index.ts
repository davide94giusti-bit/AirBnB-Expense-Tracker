export interface User {
  uid: string;
  email: string;
  displayName: string;
  role: 'superAdmin' | 'manager' | 'viewer';
  apartments: string[];
  createdAt: Date;
}

export interface Apartment {
  id: string;
  name: string;
  address: string;
  currency: string;
  owners: string[];
  shares?: Record<string, number>;
  createdAt: Date;
}

export interface Guest {
  id: string;
  apartmentId: string;
  firstName: string;
  lastName: string;
  idNumber: string;
  idImageUrl?: string;
  createdAt: Date;
}

export interface CalendarEvent {
  id: string;
  apartmentId: string;
  date: string;
  status: 'occupied' | 'maintenance' | 'cleaning' | 'free';
  notes: string;
  guests: string[];
  bookingId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Expense {
  id: string;
  apartmentId: string;
  userId: string;
  type: 'maintenance' | 'cleaning' | 'utilities' | 'tax' | 'other';
  description: string;
  amount: number;
  currency: string;
  date: string;
  notes?: string;
  photoUrls?: string[];
  createdAt: Date;
}

export interface Payment {
  id: string;
  apartmentId: string;
  fromUserId: string;
  toUserId: string;
  amount: number;
  currency: string;
  reason: string;
  relatedExpenseIds?: string[];
  createdAt: Date;
}

export interface Balance {
  userId: string;
  displayName: string;
  net: number;
}