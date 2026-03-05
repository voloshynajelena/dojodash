import {
  getFirestoreDb,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  query,
  where,
  onSnapshot,
  serverTimestamp,
  type Unsubscribe,
} from '../client/firestore';
import type { Attendance, AttendanceSummary } from '@dojodash/core/models';

const CLUBS_COLLECTION = 'clubs';
const SESSIONS_SUBCOLLECTION = 'sessions';
const ATTENDANCE_SUBCOLLECTION = 'attendance';

export async function getAttendance(
  clubId: string,
  sessionId: string,
  childId: string
): Promise<Attendance | null> {
  const db = getFirestoreDb();
  const docRef = doc(
    db,
    CLUBS_COLLECTION,
    clubId,
    SESSIONS_SUBCOLLECTION,
    sessionId,
    ATTENDANCE_SUBCOLLECTION,
    childId
  );
  const snapshot = await getDoc(docRef);
  if (!snapshot.exists()) return null;
  return { id: snapshot.id, ...snapshot.data() } as Attendance;
}

export async function getSessionAttendance(
  clubId: string,
  sessionId: string
): Promise<Attendance[]> {
  const db = getFirestoreDb();
  const colRef = collection(
    db,
    CLUBS_COLLECTION,
    clubId,
    SESSIONS_SUBCOLLECTION,
    sessionId,
    ATTENDANCE_SUBCOLLECTION
  );
  const snapshot = await getDocs(colRef);
  return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Attendance);
}

export async function getChildAttendanceHistory(
  clubId: string,
  childId: string
): Promise<Attendance[]> {
  const db = getFirestoreDb();
  const sessionsRef = collection(db, CLUBS_COLLECTION, clubId, SESSIONS_SUBCOLLECTION);
  const sessionsSnap = await getDocs(sessionsRef);

  const attendanceRecords: Attendance[] = [];

  for (const sessionDoc of sessionsSnap.docs) {
    const attendanceRef = doc(
      db,
      CLUBS_COLLECTION,
      clubId,
      SESSIONS_SUBCOLLECTION,
      sessionDoc.id,
      ATTENDANCE_SUBCOLLECTION,
      childId
    );
    const attendanceSnap = await getDoc(attendanceRef);
    if (attendanceSnap.exists()) {
      attendanceRecords.push({ id: attendanceSnap.id, ...attendanceSnap.data() } as Attendance);
    }
  }

  return attendanceRecords;
}

export async function markAttendance(
  clubId: string,
  sessionId: string,
  attendance: Omit<Attendance, 'id' | 'sessionId' | 'markedAt'>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(
    db,
    CLUBS_COLLECTION,
    clubId,
    SESSIONS_SUBCOLLECTION,
    sessionId,
    ATTENDANCE_SUBCOLLECTION,
    attendance.childId
  );
  await setDoc(docRef, {
    ...attendance,
    sessionId,
    markedAt: serverTimestamp(),
  });
}

export async function updateAttendance(
  clubId: string,
  sessionId: string,
  childId: string,
  data: Partial<Omit<Attendance, 'id' | 'sessionId' | 'childId' | 'markedAt'>>
): Promise<void> {
  const db = getFirestoreDb();
  const docRef = doc(
    db,
    CLUBS_COLLECTION,
    clubId,
    SESSIONS_SUBCOLLECTION,
    sessionId,
    ATTENDANCE_SUBCOLLECTION,
    childId
  );
  await updateDoc(docRef, {
    ...data,
    markedAt: serverTimestamp(),
  });
}

export function subscribeToSessionAttendance(
  clubId: string,
  sessionId: string,
  callback: (attendance: Attendance[]) => void
): Unsubscribe {
  const db = getFirestoreDb();
  const colRef = collection(
    db,
    CLUBS_COLLECTION,
    clubId,
    SESSIONS_SUBCOLLECTION,
    sessionId,
    ATTENDANCE_SUBCOLLECTION
  );
  return onSnapshot(colRef, (snapshot) => {
    const attendance = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }) as Attendance);
    callback(attendance);
  });
}

export function calculateAttendanceSummary(
  sessionId: string,
  attendance: Attendance[]
): AttendanceSummary {
  return {
    sessionId,
    total: attendance.length,
    present: attendance.filter((a) => a.status === 'present').length,
    absent: attendance.filter((a) => a.status === 'absent').length,
    excused: attendance.filter((a) => a.status === 'excused').length,
    late: attendance.filter((a) => a.status === 'late').length,
  };
}
