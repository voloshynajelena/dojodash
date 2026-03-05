import {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
  type Functions,
  type HttpsCallableResult,
} from 'firebase/functions';
import { getFirebaseApp } from './app';
import { isEmulatorMode } from './config';
import type {
  AdminCreateClubRequest,
  AdminCreateClubResponse,
  AdminCreateCoachRequest,
  AdminCreateCoachResponse,
  AdminAssignCoachToClubsRequest,
  AdminAssignCoachToClubsResponse,
  AdminSetUserDisabledRequest,
  AdminSetUserDisabledResponse,
  AwardOrTransferMedalRequest,
  AwardOrTransferMedalResponse,
  ApplyAttendanceBatchRequest,
  ApplyAttendanceBatchResponse,
  CreateInviteRequest,
  CreateInviteResponse,
  ClaimInviteRequest,
  ClaimInviteResponse,
} from '@dojodash/core';

let functions: Functions | undefined;
let emulatorConnected = false;

export function getFirebaseFunctions(): Functions {
  if (functions) return functions;

  const app = getFirebaseApp();
  functions = getFunctions(app);

  if (isEmulatorMode() && !emulatorConnected && typeof window !== 'undefined') {
    connectFunctionsEmulator(functions, '127.0.0.1', 5001);
    emulatorConnected = true;
  }

  return functions;
}

function createCallable<TRequest, TResponse>(name: string) {
  return async (data: TRequest): Promise<TResponse> => {
    const functions = getFirebaseFunctions();
    const callable = httpsCallable<TRequest, TResponse>(functions, name);
    const result: HttpsCallableResult<TResponse> = await callable(data);
    return result.data;
  };
}

export const adminCreateClub = createCallable<AdminCreateClubRequest, AdminCreateClubResponse>(
  'adminCreateClub'
);

export const adminCreateCoach = createCallable<AdminCreateCoachRequest, AdminCreateCoachResponse>(
  'adminCreateCoach'
);

export const adminAssignCoachToClubs = createCallable<
  AdminAssignCoachToClubsRequest,
  AdminAssignCoachToClubsResponse
>('adminAssignCoachToClubs');

export const adminSetUserDisabled = createCallable<
  AdminSetUserDisabledRequest,
  AdminSetUserDisabledResponse
>('adminSetUserDisabled');

export const awardOrTransferMedal = createCallable<
  AwardOrTransferMedalRequest,
  AwardOrTransferMedalResponse
>('awardOrTransferMedal');

export const applyAttendanceBatch = createCallable<
  ApplyAttendanceBatchRequest,
  ApplyAttendanceBatchResponse
>('applyAttendanceBatch');

export const createInvite = createCallable<CreateInviteRequest, CreateInviteResponse>(
  'createInvite'
);

export const claimInvite = createCallable<ClaimInviteRequest, ClaimInviteResponse>('claimInvite');
