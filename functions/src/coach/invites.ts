import { onCall, HttpsError } from 'firebase-functions/v2/https';
import { getFirestore, FieldValue, Timestamp } from 'firebase-admin/firestore';
import type { CreateInviteRequest, CreateInviteResponse, ClaimInviteRequest, ClaimInviteResponse } from '@dojodash/core';
import { requireClubAccess, requireAuth, createAuditLog, createNotification } from '../utils';

function generateInviteCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 8; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
}

export const createInvite = onCall<CreateInviteRequest, Promise<CreateInviteResponse>>(
  { invoker: 'public' },
  async (request) => {
    const { clubId, groupId, expiresInDays = 7, maxUses = 10 } = request.data;

    if (!clubId || !groupId) {
      throw new HttpsError('invalid-argument', 'clubId and groupId are required');
    }

    requireClubAccess(request, clubId);

    const db = getFirestore();
    const code = generateInviteCode();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + expiresInDays);

    const inviteRef = db
      .collection('clubs')
      .doc(clubId)
      .collection('groups')
      .doc(groupId)
      .collection('invites')
      .doc();

    await inviteRef.set({
      clubId,
      groupId,
      code,
      createdBy: request.auth!.uid,
      expiresAt: Timestamp.fromDate(expiresAt),
      maxUses,
      usedCount: 0,
      createdAt: FieldValue.serverTimestamp(),
    });

    await createAuditLog({
      action: 'invite.created',
      actorUid: request.auth!.uid,
      actorEmail: request.auth!.token.email ?? '',
      targetType: 'invite',
      targetId: inviteRef.id,
      clubId,
      metadata: { groupId, code, expiresInDays, maxUses },
    });

    return {
      code,
      expiresAt: expiresAt.getTime(),
    };
  }
);

export const claimInvite = onCall<ClaimInviteRequest, Promise<ClaimInviteResponse>>(
  { invoker: 'public' },
  async (request) => {
    const claims = requireAuth(request);
    const { code, childId } = request.data;

    if (!code || !childId) {
      throw new HttpsError('invalid-argument', 'code and childId are required');
    }

    if (claims.role !== 'FAMILY') {
      throw new HttpsError('permission-denied', 'Only families can claim invites');
    }

    const db = getFirestore();

    const childDoc = await db
      .collection('users')
      .doc(request.auth!.uid)
      .collection('children')
      .doc(childId)
      .get();

    if (!childDoc.exists) {
      throw new HttpsError('not-found', 'Child not found');
    }

    const childData = childDoc.data()!;

    const clubsSnapshot = await db.collection('clubs').get();
    let foundInvite: FirebaseFirestore.DocumentSnapshot | null = null;
    let foundClubId: string | null = null;
    let foundGroupId: string | null = null;

    for (const clubDoc of clubsSnapshot.docs) {
      const groupsSnapshot = await clubDoc.ref.collection('groups').get();
      for (const groupDoc of groupsSnapshot.docs) {
        const invitesSnapshot = await groupDoc.ref
          .collection('invites')
          .where('code', '==', code)
          .limit(1)
          .get();

        if (!invitesSnapshot.empty) {
          foundInvite = invitesSnapshot.docs[0]!;
          foundClubId = clubDoc.id;
          foundGroupId = groupDoc.id;
          break;
        }
      }
      if (foundInvite) break;
    }

    if (!foundInvite || !foundClubId || !foundGroupId) {
      throw new HttpsError('not-found', 'Invalid invite code');
    }

    const inviteData = foundInvite.data()!;

    if (inviteData.expiresAt.toDate() < new Date()) {
      throw new HttpsError('failed-precondition', 'Invite has expired');
    }

    if (inviteData.usedCount >= inviteData.maxUses) {
      throw new HttpsError('failed-precondition', 'Invite has reached maximum uses');
    }

    const memberRef = db
      .collection('clubs')
      .doc(foundClubId)
      .collection('groups')
      .doc(foundGroupId)
      .collection('members')
      .doc(childId);

    const existingMember = await memberRef.get();
    if (existingMember.exists) {
      throw new HttpsError('already-exists', 'Child is already a member of this group');
    }

    const batch = db.batch();

    batch.set(memberRef, {
      childId,
      childName: `${childData.firstName} ${childData.lastName}`,
      parentUid: request.auth!.uid,
      joinedAt: FieldValue.serverTimestamp(),
      status: 'active',
    });

    batch.update(foundInvite.ref, {
      usedCount: FieldValue.increment(1),
    });

    batch.update(childDoc.ref, {
      groupIds: FieldValue.arrayUnion(foundGroupId),
      updatedAt: FieldValue.serverTimestamp(),
    });

    const groupDoc = await db
      .collection('clubs')
      .doc(foundClubId)
      .collection('groups')
      .doc(foundGroupId)
      .get();
    const groupName = groupDoc.data()?.name ?? 'Unknown Group';

    batch.update(groupDoc.ref, {
      memberCount: FieldValue.increment(1),
    });

    await batch.commit();

    await createNotification({
      userId: request.auth!.uid,
      type: 'group_joined',
      title: 'Joined Group',
      body: `${childData.firstName} has joined ${groupName}!`,
      data: { clubId: foundClubId, groupId: foundGroupId, childId },
    });

    await createAuditLog({
      action: 'invite.claimed',
      actorUid: request.auth!.uid,
      actorEmail: request.auth!.token.email ?? '',
      targetType: 'invite',
      targetId: foundInvite.id,
      clubId: foundClubId,
      metadata: { groupId: foundGroupId, childId, code },
    });

    return {
      success: true,
      groupId: foundGroupId,
      groupName,
    };
  }
);
