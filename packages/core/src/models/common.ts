export interface Timestamp {
  seconds: number;
  nanoseconds: number;
}

export interface GeoPoint {
  latitude: number;
  longitude: number;
}

export type DayOfWeek = 0 | 1 | 2 | 3 | 4 | 5 | 6;

export interface TimeSlot {
  hour: number;
  minute: number;
}

export interface DateRange {
  start: Timestamp;
  end: Timestamp;
}
