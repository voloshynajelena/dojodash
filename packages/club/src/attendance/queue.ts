import type { AttendanceRecord, SyncStatus } from '@dojodash/core/models';

export interface QueuedAttendance {
  id: string;
  sessionId: string;
  clubId: string;
  groupId: string;
  records: AttendanceRecord[];
  submittedAt: number;
  retryCount: number;
  syncStatus: SyncStatus;
  deviceId?: string;
}

const STORAGE_KEY = 'dojodash_attendance_queue';
const MAX_RETRIES = 3;

export class AttendanceQueue {
  private queue: QueuedAttendance[] = [];
  private storage: Storage | null = null;

  constructor() {
    if (typeof window !== 'undefined') {
      this.storage = window.localStorage;
      this.loadFromStorage();
    }
  }

  private loadFromStorage(): void {
    if (!this.storage) return;
    try {
      const data = this.storage.getItem(STORAGE_KEY);
      if (data) {
        this.queue = JSON.parse(data);
      }
    } catch {
      this.queue = [];
    }
  }

  private saveToStorage(): void {
    if (!this.storage) return;
    try {
      this.storage.setItem(STORAGE_KEY, JSON.stringify(this.queue));
    } catch {
      console.error('Failed to save attendance queue to storage');
    }
  }

  add(item: Omit<QueuedAttendance, 'id' | 'submittedAt' | 'retryCount' | 'syncStatus'>): string {
    const id = `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const queuedItem: QueuedAttendance = {
      ...item,
      id,
      submittedAt: Date.now(),
      retryCount: 0,
      syncStatus: 'pending',
    };
    this.queue.push(queuedItem);
    this.saveToStorage();
    return id;
  }

  remove(id: string): void {
    this.queue = this.queue.filter((item) => item.id !== id);
    this.saveToStorage();
  }

  markSynced(id: string): void {
    const item = this.queue.find((i) => i.id === id);
    if (item) {
      item.syncStatus = 'synced';
      this.saveToStorage();
    }
  }

  markFailed(id: string): void {
    const item = this.queue.find((i) => i.id === id);
    if (item) {
      item.retryCount += 1;
      item.syncStatus = item.retryCount >= MAX_RETRIES ? 'failed' : 'pending';
      this.saveToStorage();
    }
  }

  getPending(): QueuedAttendance[] {
    return this.queue.filter((item) => item.syncStatus === 'pending');
  }

  getFailed(): QueuedAttendance[] {
    return this.queue.filter((item) => item.syncStatus === 'failed');
  }

  getAll(): QueuedAttendance[] {
    return [...this.queue];
  }

  clear(): void {
    this.queue = [];
    this.saveToStorage();
  }

  clearSynced(): void {
    this.queue = this.queue.filter((item) => item.syncStatus !== 'synced');
    this.saveToStorage();
  }

  getSize(): number {
    return this.queue.length;
  }

  getPendingCount(): number {
    return this.getPending().length;
  }
}

let queueInstance: AttendanceQueue | null = null;

export function getAttendanceQueue(): AttendanceQueue {
  if (!queueInstance) {
    queueInstance = new AttendanceQueue();
  }
  return queueInstance;
}
