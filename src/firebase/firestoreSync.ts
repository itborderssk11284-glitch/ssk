import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDoc,
  writeBatch,
} from 'firebase/firestore';
import { db } from './config';
import { handleFirestoreError, OperationType } from './errorHandler';
import {
  DepartmentDailyLog,
  DepartmentId,
  StandardWeights,
  ActivityCatalogItem,
  DepartmentActivitiesMap,
} from '../types/staffing';
import {
  DEFAULT_STANDARD_WEIGHTS,
  INITIAL_DAILY_LOGS,
  DEFAULT_DEPARTMENT_ACTIVITIES,
} from '../data/defaults';

// Document ID for single global standard weights configuration
const WEIGHTS_DOC_ID = 'hospital_formula_weights';

export interface FirestoreSyncStatus {
  isConnected: boolean;
  isSyncing: boolean;
  lastSyncedAt: Date | null;
  error: string | null;
  pendingChangesCount: number;
}

/**
 * Real-time subscription to `daily_logs` collection in Firestore.
 * Automatically seeds INITIAL_DAILY_LOGS if the collection is empty.
 */
export function subscribeToDailyLogs(
  onData: (logs: DepartmentDailyLog[]) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, 'daily_logs');

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Automatically populate with initial logs
        try {
          const batch = writeBatch(db);
          for (const log of INITIAL_DAILY_LOGS) {
            const docRef = doc(db, 'daily_logs', log.id);
            batch.set(docRef, log);
          }
          await batch.commit();
          onData(INITIAL_DAILY_LOGS);
        } catch (seedErr) {
          console.warn('Could not seed initial logs to Firestore, using local fallback:', seedErr);
          onData(INITIAL_DAILY_LOGS);
        }
      } else {
        const logs: DepartmentDailyLog[] = [];
        snapshot.forEach((docSnap) => {
          logs.push(docSnap.data() as DepartmentDailyLog);
        });
        onData(logs);
      }
    },
    (error) => {
      console.warn('Firestore daily_logs snapshot error:', error);
      handleFirestoreError(error, OperationType.LIST, 'daily_logs');
      onError?.(error);
    }
  );
}

/**
 * Save or update a daily log in Firestore.
 */
export async function saveDailyLogToFirestore(log: DepartmentDailyLog): Promise<void> {
  try {
    const docRef = doc(db, 'daily_logs', log.id);
    await setDoc(docRef, log, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `daily_logs/${log.id}`);
    throw error;
  }
}

/**
 * Delete a daily log from Firestore.
 */
export async function deleteDailyLogFromFirestore(logId: string): Promise<void> {
  try {
    const docRef = doc(db, 'daily_logs', logId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `daily_logs/${logId}`);
    throw error;
  }
}

/**
 * Real-time subscription to `standard_weights` in Firestore.
 * Automatically seeds default standard weights if not present.
 */
export function subscribeToStandardWeights(
  onData: (weights: StandardWeights) => void,
  onError?: (err: Error) => void
): () => void {
  const docRef = doc(db, 'standard_weights', WEIGHTS_DOC_ID);

  return onSnapshot(
    docRef,
    async (snapshot) => {
      if (snapshot.exists()) {
        onData(snapshot.data() as StandardWeights);
      } else {
        try {
          await setDoc(docRef, DEFAULT_STANDARD_WEIGHTS);
          onData(DEFAULT_STANDARD_WEIGHTS);
        } catch (seedErr) {
          console.warn('Could not seed standard weights to Firestore:', seedErr);
          onData(DEFAULT_STANDARD_WEIGHTS);
        }
      }
    },
    (error) => {
      console.warn('Firestore standard_weights snapshot error:', error);
      handleFirestoreError(error, OperationType.GET, `standard_weights/${WEIGHTS_DOC_ID}`);
      onError?.(error);
    }
  );
}

/**
 * Save standard weights configuration to Firestore.
 */
export async function saveStandardWeightsToFirestore(weights: StandardWeights): Promise<void> {
  try {
    const docRef = doc(db, 'standard_weights', WEIGHTS_DOC_ID);
    await setDoc(docRef, weights, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `standard_weights/${WEIGHTS_DOC_ID}`);
    throw error;
  }
}

/**
 * Helper to build DepartmentActivitiesMap from catalog items
 */
function buildActivitiesMap(items: ActivityCatalogItem[]): DepartmentActivitiesMap {
  // Start with empty map for all departments
  const result: DepartmentActivitiesMap = {
    ER: { indirect: [], unit: [] },
    OPD: { indirect: [], unit: [] },
    IPD1: { indirect: [], unit: [] },
    IPD2: { indirect: [], unit: [] },
    LR: { indirect: [], unit: [] },
  };

  // Populate from items
  for (const item of items) {
    const deptId = item.departmentId || 'ER';
    if (!result[deptId]) {
      result[deptId] = { indirect: [], unit: [] };
    }
    const targetArray = item.category === 'indirect_care' ? result[deptId].indirect : result[deptId].unit;
    targetArray.push(item);
  }

  // Fallback: If a department has no activities, populate with default activities
  const depts: DepartmentId[] = ['ER', 'OPD', 'IPD1', 'IPD2', 'LR'];
  for (const dept of depts) {
    if (result[dept].indirect.length === 0 && result[dept].unit.length === 0 && DEFAULT_DEPARTMENT_ACTIVITIES[dept]) {
      result[dept] = DEFAULT_DEPARTMENT_ACTIVITIES[dept];
    }
  }

  return result;
}

/**
 * Real-time subscription to `activity_catalog` collection in Firestore.
 */
export function subscribeToDepartmentActivities(
  onData: (map: DepartmentActivitiesMap) => void,
  onError?: (err: Error) => void
): () => void {
  const colRef = collection(db, 'activity_catalog');

  return onSnapshot(
    colRef,
    async (snapshot) => {
      if (snapshot.empty) {
        // Seed default department activities into Firestore
        try {
          const batch = writeBatch(db);
          const depts: DepartmentId[] = ['ER', 'OPD', 'IPD1', 'IPD2', 'LR'];
          for (const dept of depts) {
            const config = DEFAULT_DEPARTMENT_ACTIVITIES[dept];
            if (config) {
              for (const act of config.indirect) {
                const docRef = doc(db, 'activity_catalog', act.id);
                batch.set(docRef, { ...act, departmentId: dept });
              }
              for (const act of config.unit) {
                const docRef = doc(db, 'activity_catalog', act.id);
                batch.set(docRef, { ...act, departmentId: dept });
              }
            }
          }
          await batch.commit();
          onData(DEFAULT_DEPARTMENT_ACTIVITIES);
        } catch (seedErr) {
          console.warn('Could not seed activity catalog to Firestore:', seedErr);
          onData(DEFAULT_DEPARTMENT_ACTIVITIES);
        }
      } else {
        const items: ActivityCatalogItem[] = [];
        snapshot.forEach((docSnap) => {
          items.push(docSnap.data() as ActivityCatalogItem);
        });
        const map = buildActivitiesMap(items);
        onData(map);
      }
    },
    (error) => {
      console.warn('Firestore activity_catalog snapshot error:', error);
      handleFirestoreError(error, OperationType.LIST, 'activity_catalog');
      onError?.(error);
    }
  );
}

/**
 * Save an activity catalog item to Firestore.
 */
export async function saveActivityToFirestore(
  activity: ActivityCatalogItem,
  deptId: DepartmentId
): Promise<void> {
  try {
    const docRef = doc(db, 'activity_catalog', activity.id);
    await setDoc(docRef, { ...activity, departmentId: deptId }, { merge: true });
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `activity_catalog/${activity.id}`);
    throw error;
  }
}

/**
 * Delete an activity catalog item from Firestore.
 */
export async function deleteActivityFromFirestore(activityId: string): Promise<void> {
  try {
    const docRef = doc(db, 'activity_catalog', activityId);
    await deleteDoc(docRef);
  } catch (error) {
    handleFirestoreError(error, OperationType.DELETE, `activity_catalog/${activityId}`);
    throw error;
  }
}

/**
 * Reset department activities to defaults in Firestore.
 */
export async function resetDepartmentActivitiesInFirestore(deptId: DepartmentId): Promise<void> {
  try {
    const defaultActs = DEFAULT_DEPARTMENT_ACTIVITIES[deptId];
    if (!defaultActs) return;

    // Delete existing custom activities for this department
    const colRef = collection(db, 'activity_catalog');
    const snap = await getDocs(colRef);
    const batch = writeBatch(db);

    snap.forEach((docSnap) => {
      const data = docSnap.data() as ActivityCatalogItem;
      if (data.departmentId === deptId) {
        batch.delete(docSnap.ref);
      }
    });

    // Re-insert defaults
    for (const act of defaultActs.indirect) {
      batch.set(doc(db, 'activity_catalog', act.id), { ...act, departmentId: deptId });
    }
    for (const act of defaultActs.unit) {
      batch.set(doc(db, 'activity_catalog', act.id), { ...act, departmentId: deptId });
    }

    await batch.commit();
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, `activity_catalog/reset/${deptId}`);
    throw error;
  }
}
