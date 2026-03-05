import {
  getStorage,
  connectStorageEmulator,
  ref,
  uploadBytes,
  uploadBytesResumable,
  getDownloadURL,
  deleteObject,
  type FirebaseStorage,
  type StorageReference,
  type UploadTask,
} from 'firebase/storage';
import { getFirebaseApp } from './app';
import { isEmulatorMode } from './config';

let storage: FirebaseStorage | undefined;
let emulatorConnected = false;

export function getFirebaseStorage(): FirebaseStorage {
  if (storage) return storage;

  const app = getFirebaseApp();
  storage = getStorage(app);

  if (isEmulatorMode() && !emulatorConnected && typeof window !== 'undefined') {
    connectStorageEmulator(storage, '127.0.0.1', 9199);
    emulatorConnected = true;
  }

  return storage;
}

export async function uploadFile(
  path: string,
  file: Blob | Uint8Array | ArrayBuffer
): Promise<string> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);
  await uploadBytes(storageRef, file);
  return getDownloadURL(storageRef);
}

export function uploadFileWithProgress(
  path: string,
  file: Blob | Uint8Array | ArrayBuffer
): UploadTask {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);
  return uploadBytesResumable(storageRef, file);
}

export async function getFileUrl(path: string): Promise<string> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);
  return getDownloadURL(storageRef);
}

export async function deleteFile(path: string): Promise<void> {
  const storage = getFirebaseStorage();
  const storageRef = ref(storage, path);
  await deleteObject(storageRef);
}

export { ref, type StorageReference, type UploadTask };
