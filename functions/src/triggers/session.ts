import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { getFirestore } from 'firebase-admin/firestore';
import { notifyClubFamilies } from '../utils';

function formatSessionDate(timestamp: { seconds: number }): string {
  const date = new Date(timestamp.seconds * 1000);
  return date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export const onSessionWrite = onDocumentWritten(
  'clubs/{clubId}/sessions/{sessionId}',
  async (event) => {
    const { clubId, sessionId } = event.params;
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!afterData) return;

    const db = getFirestore();

    // Get group name for better notifications
    let groupName = 'your group';
    try {
      const groupDoc = await db
        .collection('clubs')
        .doc(clubId)
        .collection('groups')
        .doc(afterData.groupId)
        .get();
      groupName = groupDoc.data()?.name || 'your group';
    } catch (e) {
      console.error('Failed to get group name:', e);
    }

    // Session cancelled
    if (afterData.status === 'cancelled' && beforeData?.status !== 'cancelled') {
      const dateStr = afterData.startTime ? formatSessionDate(afterData.startTime) : '';
      await notifyClubFamilies(clubId, afterData.groupId, {
        type: 'session_cancelled',
        title: 'Session Cancelled',
        body: `${groupName} session${dateStr ? ` on ${dateStr}` : ''} has been cancelled.${afterData.notes ? ` Note: ${afterData.notes}` : ''}`,
        data: { clubId, sessionId, groupId: afterData.groupId },
      });
      return;
    }

    // New session created
    if (!beforeData && afterData.status !== 'cancelled') {
      const dateStr = afterData.startTime ? formatSessionDate(afterData.startTime) : '';
      await notifyClubFamilies(clubId, afterData.groupId, {
        type: 'session_scheduled',
        title: 'New Session Scheduled',
        body: `${groupName} has a new session${dateStr ? ` on ${dateStr}` : ''}.`,
        data: { clubId, sessionId, groupId: afterData.groupId },
      });
      return;
    }

    // Session rescheduled (time changed)
    if (
      beforeData?.startTime?.seconds !== afterData.startTime?.seconds &&
      afterData.status !== 'cancelled'
    ) {
      const newDateStr = afterData.startTime ? formatSessionDate(afterData.startTime) : '';
      await notifyClubFamilies(clubId, afterData.groupId, {
        type: 'session_scheduled',
        title: 'Session Rescheduled',
        body: `${groupName} session has been rescheduled${newDateStr ? ` to ${newDateStr}` : ''}.`,
        data: { clubId, sessionId, groupId: afterData.groupId },
      });
    }
  }
);
