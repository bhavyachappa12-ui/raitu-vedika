/// <reference types="vite/client" />
import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { initializeFirestore, doc, getDocFromServer, getDoc } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import firebaseConfigFile from '../../firebase-applet-config.json';

// Detect if running in local development (VS Code localhost) vs AI Studio cloud preview
const isLocalhost = typeof window !== 'undefined' && 
  (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1');

// In local development, respect local environment variables (e.g. raitu-vedika).
// In AI Studio container / preview iframe, prioritize the provisioned database from firebase-applet-config.json.
const projectId = (
  isLocalhost
    ? (import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.FIREBASE_PROJECT_ID || firebaseConfigFile.projectId || 'raitu-vedika')
    : (firebaseConfigFile.projectId || import.meta.env.VITE_FIREBASE_PROJECT_ID || import.meta.env.FIREBASE_PROJECT_ID || 'raitu-vedika')
) as string;

const apiKey = (
  isLocalhost
    ? (import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.FIREBASE_API_KEY || (firebaseConfigFile as any).apiKey || '')
    : ((firebaseConfigFile as any).apiKey || import.meta.env.VITE_FIREBASE_API_KEY || import.meta.env.FIREBASE_API_KEY || '')
) as string;

const rawDbId = (
  isLocalhost
    ? (import.meta.env.VITE_FIREBASE_DATABASE_ID || import.meta.env.FIREBASE_DATABASE_ID || (firebaseConfigFile as any).firestoreDatabaseId || '(default)')
    : ((firebaseConfigFile as any).firestoreDatabaseId || import.meta.env.VITE_FIREBASE_DATABASE_ID || import.meta.env.FIREBASE_DATABASE_ID || '(default)')
) as string;

const firestoreDatabaseId = (!rawDbId || rawDbId === '(default)') ? undefined : rawDbId;

const authDomain = (
  isLocalhost
    ? (import.meta.env.VITE_FIREBASE_AUTH_DOMAIN || import.meta.env.FIREBASE_AUTH_DOMAIN || `${projectId}.firebaseapp.com`)
    : ((firebaseConfigFile as any).authDomain || `${projectId}.firebaseapp.com`)
) as string;

const storageBucket = (
  isLocalhost
    ? (import.meta.env.VITE_FIREBASE_STORAGE_BUCKET || import.meta.env.FIREBASE_STORAGE_BUCKET || `${projectId}.firebasestorage.app`)
    : ((firebaseConfigFile as any).storageBucket || `${projectId}.firebasestorage.app`)
) as string;

const appId = (
  isLocalhost
    ? (import.meta.env.VITE_FIREBASE_APP_ID || import.meta.env.FIREBASE_APP_ID || (firebaseConfigFile as any).appId || '')
    : ((firebaseConfigFile as any).appId || '')
) as string;

const messagingSenderId = (
  isLocalhost
    ? (import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID || import.meta.env.FIREBASE_MESSAGING_SENDER_ID || (firebaseConfigFile as any).messagingSenderId || '')
    : ((firebaseConfigFile as any).messagingSenderId || '')
) as string;

const activeFirebaseConfig = {
  projectId,
  apiKey,
  authDomain,
  storageBucket,
  appId,
  messagingSenderId,
  firestoreDatabaseId: rawDbId
};

const app = initializeApp(activeFirebaseConfig);

export const db = initializeFirestore(app, {
  experimentalAutoDetectLongPolling: true,
  ignoreUndefinedProperties: true,
}, firestoreDatabaseId);

export const auth = getAuth(app);
export const storage = getStorage(app);

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    // Attempt non-blocking connection check with timeout guard
    const testDocPromise = getDocFromServer(doc(db, 'test', 'connection'));
    const timeoutPromise = new Promise((_, reject) => 
      setTimeout(() => reject(new Error('connection timeout')), 4000)
    );
    await Promise.race([testDocPromise, timeoutPromise]);
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('the client is offline')) {
        console.warn("Firestore running in offline/cache-fallback mode. Attempting cached connection check.");
        try {
          await getDoc(doc(db, 'test', 'connection'));
        } catch (_) {
          // Graceful fallback
        }
      }
    }
  }
}

testConnection();

