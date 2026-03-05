import { onDocumentWritten } from 'firebase-functions/v2/firestore';
import { notifyClubFamilies } from '../utils';

export const onSessionWrite = onDocumentWritten(
  'clubs/{clubId}/sessions/{sessionId}',
  async (event) => {
    const { clubId, sessionId } = event.params;
    const beforeData = event.data?.before.data();
    const afterData = event.data?.after.data();

    if (!afterData) return;

    if (afterData.status === 'cancelled' && beforeData?.status !== 'cancelled') {
      await notifyClubFamilies(clubId, afterData.groupId, {
        type: 'session_cancelled',
        title: 'Session Cancelled',
        body: afterData.notes
          ? `Session cancelled: ${afterData.notes}`
          : 'A session has been cancelled',
        data: { clubId, sessionId, groupId: afterData.groupId },
      });
    }
  }
);
