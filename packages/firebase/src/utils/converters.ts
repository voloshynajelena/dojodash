import { Timestamp } from 'firebase/firestore';
import type { Timestamp as TimestampType } from '@dojodash/core';

export function toFirestoreTimestamp(date: Date): Timestamp {
  return Timestamp.fromDate(date);
}

export function fromFirestoreTimestamp(timestamp: Timestamp | TimestampType): Date {
  if (timestamp instanceof Timestamp) {
    return timestamp.toDate();
  }
  return new Date(timestamp.seconds * 1000 + timestamp.nanoseconds / 1000000);
}

export function nowTimestamp(): TimestampType {
  const now = new Date();
  return {
    seconds: Math.floor(now.getTime() / 1000),
    nanoseconds: (now.getTime() % 1000) * 1000000,
  };
}

export function formatTimestamp(timestamp: TimestampType, locale = 'en-US'): string {
  const date = fromFirestoreTimestamp(timestamp as Timestamp);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export function formatDate(timestamp: TimestampType, locale = 'en-US'): string {
  const date = fromFirestoreTimestamp(timestamp as Timestamp);
  return date.toLocaleDateString(locale, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

export function formatTime(timestamp: TimestampType, locale = 'en-US'): string {
  const date = fromFirestoreTimestamp(timestamp as Timestamp);
  return date.toLocaleTimeString(locale, {
    hour: '2-digit',
    minute: '2-digit',
  });
}
