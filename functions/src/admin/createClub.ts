import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import type { AdminCreateClubRequest, AdminCreateClubResponse } from '@dojodash/core/contracts';
import { DEFAULT_CLUB_SETTINGS } from '@dojodash/core/models';
import { requireAdmin, createAuditLog } from '../utils';

export const adminCreateClub = onCall<AdminCreateClubRequest, Promise<AdminCreateClubResponse>>(
  async (request) => {
    const claims = requireAdmin(request);
    const { name, slug, timezone, settings } = request.data;

    if (!name || !slug || !timezone) {
      throw new HttpsError('invalid-argument', 'name, slug, and timezone are required');
    }

    const db = getFirestore();

    const existingClub = await db
      .collection('clubs')
      .where('slug', '==', slug)
      .limit(1)
      .get();

    if (!existingClub.empty) {
      throw new HttpsError('already-exists', 'A club with this slug already exists');
    }

    const clubRef = db.collection('clubs').doc();
    await clubRef.set({
      name,
      slug,
      timezone,
      settings: { ...DEFAULT_CLUB_SETTINGS, ...settings },
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });

    await createAuditLog({
      action: 'club.created',
      actorUid: request.auth!.uid,
      actorEmail: request.auth!.token.email ?? '',
      targetType: 'club',
      targetId: clubRef.id,
      clubId: clubRef.id,
      metadata: { name, slug },
    });

    return { clubId: clubRef.id };
  }
);
