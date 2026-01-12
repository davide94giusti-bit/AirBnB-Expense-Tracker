import { Expense, Payment, Balance, User } from '../types';

export function computeBalances(
  expenses: Expense[],
  payments: Payment[],
  shares: Record<string, number>,
  users: Map<string, User>
): Balance[] {
  const owed: Record<string, number> = {};
  const paid: Record<string, number> = {};

  // Calculate owed amounts based on shares
  expenses.forEach((exp) => {
    Object.entries(shares).forEach(([uid, share]) => {
      owed[uid] = (owed[uid] ?? 0) + exp.amount * (share as number);
    });
    const payer = exp.userId;
    paid[payer] = (paid[payer] ?? 0) + exp.amount;
  });

  // Subtract payments
  payments.forEach((payment) => {
    paid[payment.fromUserId] = (paid[payment.fromUserId] ?? 0) + payment.amount;
  });

  // Compute net (positive = they are owed, negative = they owe)
  const net: Record<string, number> = {};
  Object.keys(owed).forEach((uid) => {
    net[uid] = (paid[uid] ?? 0) - (owed[uid] ?? 0);
  });

  // Convert to Balance[] with names
  return Object.entries(net).map(([uid, netAmount]) => ({
    userId: uid,
    displayName: users.get(uid)?.displayName ?? uid,
    net: netAmount,
  }));
}

export function calculateTouristTax(
  guests: number,
  nights: number,
  taxPerNightPerPerson: number = 3
): number {
  const cappedNights = Math.min(nights, 4);
  return guests * cappedNights * taxPerNightPerPerson;
}

export function diffInDays(a: Date, b: Date): number {
  const ms = b.getTime() - a.getTime();
  return Math.ceil(ms / (1000 * 60 * 60 * 24));
}
