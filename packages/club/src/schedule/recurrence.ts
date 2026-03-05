import dayjs from 'dayjs';
import type { SessionRecurrence, Session, TimeSlot, DayOfWeek } from '@dojodash/core/models';

export interface GenerateSessionsOptions {
  recurrence: SessionRecurrence;
  fromDate: Date;
  toDate: Date;
  excludeDates?: Date[];
}

export function generateSessionsFromRecurrence(
  options: GenerateSessionsOptions
): Omit<Session, 'id' | 'status' | 'createdAt' | 'updatedAt'>[] {
  const { recurrence, fromDate, toDate, excludeDates = [] } = options;

  const sessions: Omit<Session, 'id' | 'status' | 'createdAt' | 'updatedAt'>[] = [];
  const excludeSet = new Set(excludeDates.map((d) => dayjs(d).format('YYYY-MM-DD')));

  let current = dayjs(fromDate);
  const end = dayjs(toDate);

  while (current.isBefore(end) || current.isSame(end, 'day')) {
    if (current.day() === recurrence.dayOfWeek) {
      const dateKey = current.format('YYYY-MM-DD');

      if (!excludeSet.has(dateKey)) {
        const recurrenceStart = recurrence.startDate
          ? dayjs(new Date(recurrence.startDate.seconds * 1000))
          : null;
        const recurrenceEnd = recurrence.endDate
          ? dayjs(new Date(recurrence.endDate.seconds * 1000))
          : null;

        const isAfterStart = !recurrenceStart || current.isAfter(recurrenceStart) || current.isSame(recurrenceStart, 'day');
        const isBeforeEnd = !recurrenceEnd || current.isBefore(recurrenceEnd) || current.isSame(recurrenceEnd, 'day');

        if (isAfterStart && isBeforeEnd) {
          sessions.push({
            clubId: recurrence.clubId,
            groupId: recurrence.groupId,
            title: recurrence.title,
            date: {
              seconds: current.startOf('day').unix(),
              nanoseconds: 0,
            },
            startTime: recurrence.startTime,
            endTime: recurrence.endTime,
            recurrenceId: recurrence.id,
          });
        }
      }
    }

    current = current.add(1, 'day');
  }

  return sessions;
}

export function getNextSessionDate(
  dayOfWeek: DayOfWeek,
  fromDate: Date = new Date()
): Date {
  let current = dayjs(fromDate);
  const targetDay = dayOfWeek;

  while (current.day() !== targetDay) {
    current = current.add(1, 'day');
  }

  if (current.isSame(dayjs(fromDate), 'day')) {
    current = current.add(7, 'days');
  }

  return current.toDate();
}

export function formatTimeSlot(time: TimeSlot): string {
  const hour = time.hour % 12 || 12;
  const minute = time.minute.toString().padStart(2, '0');
  const period = time.hour < 12 ? 'AM' : 'PM';
  return `${hour}:${minute} ${period}`;
}

export function timeSlotToMinutes(time: TimeSlot): number {
  return time.hour * 60 + time.minute;
}

export function minutesToTimeSlot(minutes: number): TimeSlot {
  return {
    hour: Math.floor(minutes / 60) % 24,
    minute: minutes % 60,
  };
}

export function calculateSessionDuration(start: TimeSlot, end: TimeSlot): number {
  const startMinutes = timeSlotToMinutes(start);
  const endMinutes = timeSlotToMinutes(end);
  return endMinutes - startMinutes;
}

export const DAY_NAMES: Record<DayOfWeek, string> = {
  0: 'Sunday',
  1: 'Monday',
  2: 'Tuesday',
  3: 'Wednesday',
  4: 'Thursday',
  5: 'Friday',
  6: 'Saturday',
};

export const DAY_SHORT_NAMES: Record<DayOfWeek, string> = {
  0: 'Sun',
  1: 'Mon',
  2: 'Tue',
  3: 'Wed',
  4: 'Thu',
  5: 'Fri',
  6: 'Sat',
};
