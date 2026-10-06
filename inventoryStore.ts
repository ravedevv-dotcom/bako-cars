/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, onSnapshot, doc, setDoc, updateDoc, deleteDoc } from 'firebase/firestore';
import { db, auth } from './firebase';
import { Car } from './types';
import { SHOWROOM_VEHICLES } from './data';
import { getAllUploadedImagesMap } from './imageUploadStorage';
import { subscribeToCloudPhotos, uploadVehiclePhotosToCloud } from './cloudPhotoStorage';

const VEHICLES_COLLECTION = 'vehicles';

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
      userId: auth?.currentUser?.uid,
      email: auth?.currentUser?.email,
      emailVerified: auth?.currentUser?.emailVerified,
      isAnonymous: auth?.currentUser?.isAnonymous,
      tenantId: auth?.currentUser?.tenantId,
      providerInfo:
        auth?.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

const EXCLUDED_VEHICLE_IDS = new Set([
  'mercedes-benz-meet-the-hoann-ea-the-compact-ev-built-for-the-future-2024-121',
  'hoann-ea-compact-ev-121',
  'mercedes-benz-good-deal-bmw-x4-2021-152',
  'bmw-good-deal-x4-2021-152',
  'mercedes-benz-good-deal-hyundai-santafe-limited-2014-156',
  'hyundai-good-deal-santafe-limited-2014-156',
  'mercedes-benz-good-deal-mercedes-benz-c300-2015-155',
  'toyota-camry-se-2018-15',
  'mercedes-benz-bulletproof-toyota-landcruiser-vxr-2025-11',
  'toyota-bulletproof-landcruiser-vxr-2025-11',
]);

let latestVehiclesList: Car[] = [];
let latestCloudPhotosMap: Record<string, string[]> = {};

export function subscribeToVehicles(onUpdate: (vehicles: Car[]) => void) {
  let isSubscribed = true;

  const dispatchMerged = async () => {
    if (!isSubscribed) return;
    try {
      const localMap = await getAllUploadedImagesMap().catch(() => ({}));

      const activeShowroom = latestVehiclesList.length > 0
        ? latestVehiclesList
        : SHOWROOM_VEHICLES.filter((c) => !EXCLUDED_VEHICLE_IDS.has(c.id));

      const updated = activeShowroom.map((car) => {
        const cloudImgs = latestCloudPhotosMap[car.id] || [];
        const localImgs = localMap[car.id] || [];
        const currentImgs = car.images || [];

        // Priority 1: Cloud photos (visible to everyone everywhere)
        // Priority 2: Local uploaded photos (currently on user's laptop)
        // Priority 3: Default static images
        let effectiveImages: string[] = currentImgs;

        if (cloudImgs.length > 0) {
          effectiveImages = cloudImgs;
        } else if (localImgs.length > 0) {
          effectiveImages = localImgs;
          // Automatically sync local photos up to Cloud Firestore in background so they become web-visible!
          if (localImgs.length > 0 && cloudImgs.length === 0) {
            // Auto sync to cloud in background
            const now = new Date().toISOString();
            const writes = localImgs.map((dataUrl, idx) => {
              const docId = `${car.id}_${idx}`;
              return setDoc(doc(db, 'vehicle_photos', docId), {
                id: docId,
                carId: car.id,
                slotIndex: idx,
                dataUrl,
                updatedAt: now,
              }).catch(() => {});
            });
            Promise.all(writes).catch(() => {});
          }
        }

        return {
          ...car,
          images: effectiveImages,
        };
      });

      onUpdate(updated);
    } catch {
      onUpdate(latestVehiclesList);
    }
  };

  // Subscribe to real-time Cloud Photos (Firestore vehicle_photos)
  const unsubscribePhotos = subscribeToCloudPhotos((photosMap) => {
    latestCloudPhotosMap = photosMap;
    dispatchMerged();
  });

  // Subscribe to Vehicles collection in Firestore
  let unsubscribeVehicles = () => {};
  try {
    const colRef = collection(db, VEHICLES_COLLECTION);
    unsubscribeVehicles = onSnapshot(
      colRef,
      (snapshot) => {
        const activeShowroom = SHOWROOM_VEHICLES.filter((c) => !EXCLUDED_VEHICLE_IDS.has(c.id));
        if (snapshot.empty) {
          latestVehiclesList = activeShowroom;
          dispatchMerged();
          return;
        }

        const firestoreCars: Car[] = [];
        snapshot.forEach((docSnap) => {
          if (!EXCLUDED_VEHICLE_IDS.has(docSnap.id)) {
            firestoreCars.push({ id: docSnap.id, ...docSnap.data() } as Car);
          }
        });

        const defaultCarMap = new Map(activeShowroom.map((c) => [c.id, c]));
        const merged: Car[] = [];
        const seenIds = new Set<string>();

        firestoreCars.forEach((fCar) => {
          seenIds.add(fCar.id);
          const defaultCar = defaultCarMap.get(fCar.id);
          if (defaultCar) {
            const defaultImgs = defaultCar.images || [];
            const firestoreImgs = fCar.images || [];
            const images =
              firestoreImgs.length >= defaultImgs.length && firestoreImgs.length > 0
                ? firestoreImgs
                : defaultImgs;

            merged.push({
              ...defaultCar,
              ...fCar,
              images,
            });
          } else {
            merged.push(fCar);
          }
        });

        for (const defaultCar of activeShowroom) {
          if (!seenIds.has(defaultCar.id)) {
            merged.push(defaultCar);
          }
        }

        latestVehiclesList = merged;
        dispatchMerged();
      },
      (error) => {
        const errorMsg = error?.message || String(error);
        const activeShowroom = SHOWROOM_VEHICLES.filter((c) => !EXCLUDED_VEHICLE_IDS.has(c.id));
        latestVehiclesList = activeShowroom;
        if (errorMsg.includes('Missing or insufficient permissions')) {
          handleFirestoreError(error, OperationType.GET, VEHICLES_COLLECTION);
        } else {
          console.warn('Firestore subscription fallback to local dataset:', errorMsg);
          dispatchMerged();
        }
      }
    );
  } catch (err: any) {
    console.warn('Failed to initialize Firestore listener, using local data:', err?.message || String(err));
    latestVehiclesList = SHOWROOM_VEHICLES.filter((c) => !EXCLUDED_VEHICLE_IDS.has(c.id));
    dispatchMerged();
  }

  return () => {
    isSubscribed = false;
    unsubscribePhotos();
    unsubscribeVehicles();
  };
}

export async function saveVehicle(car: Car): Promise<void> {
  const path = `${VEHICLES_COLLECTION}/${car.id}`;
  try {
    const docRef = doc(db, VEHICLES_COLLECTION, car.id);
    await setDoc(docRef, car, { merge: true });
  } catch (error: any) {
    if (error?.message?.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
    console.error('Error saving vehicle to Firestore:', error?.message || String(error));
    throw error;
  }
}

export async function updateVehicleStatus(carId: string, status: Car['status']): Promise<void> {
  const path = `${VEHICLES_COLLECTION}/${carId}`;
  try {
    const docRef = doc(db, VEHICLES_COLLECTION, carId);
    await updateDoc(docRef, { status });
  } catch (error: any) {
    if (error?.message?.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
    console.error('Error updating vehicle status:', error?.message || String(error));
    throw error;
  }
}

export async function deleteVehicle(carId: string): Promise<void> {
  const path = `${VEHICLES_COLLECTION}/${carId}`;
  try {
    const docRef = doc(db, VEHICLES_COLLECTION, carId);
    await deleteDoc(docRef);
  } catch (error: any) {
    if (error?.message?.includes('Missing or insufficient permissions')) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
    console.error('Error deleting vehicle:', error?.message || String(error));
    throw error;
  }
}
