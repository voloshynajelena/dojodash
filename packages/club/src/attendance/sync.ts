import { getAttendanceQueue, type QueuedAttendance } from './queue';

export interface SyncResult {
  success: boolean;
  syncedCount: number;
  failedCount: number;
  errors: string[];
}

export type SyncHandler = (item: QueuedAttendance) => Promise<void>;

export class AttendanceSyncManager {
  private syncHandler: SyncHandler | null = null;
  private isSyncing = false;
  private syncInterval: ReturnType<typeof setInterval> | null = null;

  setSyncHandler(handler: SyncHandler): void {
    this.syncHandler = handler;
  }

  async syncAll(): Promise<SyncResult> {
    if (this.isSyncing || !this.syncHandler) {
      return { success: false, syncedCount: 0, failedCount: 0, errors: ['Sync already in progress or no handler'] };
    }

    this.isSyncing = true;
    const queue = getAttendanceQueue();
    const pending = queue.getPending();
    const errors: string[] = [];
    let syncedCount = 0;
    let failedCount = 0;

    for (const item of pending) {
      try {
        await this.syncHandler(item);
        queue.markSynced(item.id);
        syncedCount++;
      } catch (error) {
        queue.markFailed(item.id);
        failedCount++;
        errors.push(`Failed to sync ${item.id}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }

    queue.clearSynced();
    this.isSyncing = false;

    return {
      success: failedCount === 0,
      syncedCount,
      failedCount,
      errors,
    };
  }

  startAutoSync(intervalMs: number = 30000): void {
    if (this.syncInterval) return;

    this.syncInterval = setInterval(() => {
      if (navigator.onLine) {
        this.syncAll();
      }
    }, intervalMs);

    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this.syncAll());
    }
  }

  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
    }
  }

  isOnline(): boolean {
    return typeof navigator !== 'undefined' ? navigator.onLine : true;
  }
}

let syncManagerInstance: AttendanceSyncManager | null = null;

export function getAttendanceSyncManager(): AttendanceSyncManager {
  if (!syncManagerInstance) {
    syncManagerInstance = new AttendanceSyncManager();
  }
  return syncManagerInstance;
}
