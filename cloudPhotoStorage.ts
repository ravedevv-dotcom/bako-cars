/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { collection, doc, setDoc, deleteDoc, onSnapshot, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import {
  getAllUploadedImagesMap,
  setCarUploadedImages,
  fileToDataUrl,
} from './imageUploadStorage';
import JSZip from 'jszip';
import { Car } from './types';

// Collection where individual vehicle photos are stored (<1MB per photo)
const VEHICLE_PHOTOS_COLLECTION = 'vehicle_photos';
const GITHUB_REPO = 'ravedevv-dotcom/bakocarsv';
const getGitHubToken = () => {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('bako_github_token') || '';
  }
  return '';
};

export interface CloudPhotoRecord {
  id: string; // `${carId}_${slotIndex}`
  carId: string;
  slotIndex: number;
  dataUrl: string;
  updatedAt: string;
}

/**
 * Subscribes to real-time cloud photos in Firestore.
 * Merges them with any local photos stored in IndexedDB.
 */
export function subscribeToCloudPhotos(
  onUpdate: (photosMap: Record<string, string[]>) => void
): () => void {
  try {
    const colRef = collection(db, VEHICLE_PHOTOS_COLLECTION);
    const unsubscribe = onSnapshot(
      colRef,
      async (snapshot) => {
        const cloudMap: Record<string, { slot: number; url: string }[]> = {};

        snapshot.forEach((docSnap) => {
          const data = docSnap.data() as Partial<CloudPhotoRecord>;
          if (data.carId && typeof data.slotIndex === 'number' && data.dataUrl) {
            if (!cloudMap[data.carId]) {
              cloudMap[data.carId] = [];
            }
            cloudMap[data.carId].push({
              slot: data.slotIndex,
              url: data.dataUrl,
            });
          }
        });

        // Convert sorted arrays
        const resolvedMap: Record<string, string[]> = {};
        for (const [carId, photos] of Object.entries(cloudMap)) {
          photos.sort((a, b) => a.slot - b.slot);
          resolvedMap[carId] = photos.map((p) => p.url);
        }

        // Merge with local IndexedDB in case any exist locally
        try {
          const localMap = await getAllUploadedImagesMap();
          for (const [carId, localImgs] of Object.entries(localMap)) {
            if (localImgs && localImgs.length > 0) {
              const currentCloud = resolvedMap[carId] || [];
              if (localImgs.length > currentCloud.length) {
                resolvedMap[carId] = localImgs;
              }
            }
          }
        } catch (e) {
          console.warn('Could not read local map for merge:', e);
        }

        onUpdate(resolvedMap);
      },
      (error) => {
        console.warn('Cloud photos subscription notice:', error.message);
        // Fallback to local map
        getAllUploadedImagesMap().then(onUpdate).catch(() => onUpdate({}));
      }
    );

    return unsubscribe;
  } catch (err) {
    console.warn('Failed to subscribe to cloud photos:', err);
    getAllUploadedImagesMap().then(onUpdate).catch(() => onUpdate({}));
    return () => {};
  }
}

/**
 * Upload multiple photos for a vehicle directly to Firestore Cloud & IndexedDB cache.
 * Files do not need to be renamed - the function handles optimization & indexing automatically.
 */
export async function uploadVehiclePhotosToCloud(
  carId: string,
  files: File[] | FileList,
  maxCount: number = 12
): Promise<string[]> {
  const fileArray = Array.from(files)
    .filter((f) => f.type.startsWith('image/'))
    .slice(0, maxCount);

  if (fileArray.length === 0) {
    return [];
  }

  // Optimize & compress to high-efficiency JPEGs (1440px, ~90-120KB)
  const compressedUrls = await Promise.all(
    fileArray.map((file) => fileToDataUrl(file, 1440, 0.82))
  );

  // 1. Save to local IndexedDB for immediate responsive rendering
  await setCarUploadedImages(carId, compressedUrls);

  // 2. Save each photo as an individual document in Firestore Cloud
  const now = new Date().toISOString();
  const firestoreWrites = compressedUrls.map((dataUrl, idx) => {
    const docId = `${carId}_${idx}`;
    const docRef = doc(db, VEHICLE_PHOTOS_COLLECTION, docId);
    return setDoc(docRef, {
      id: docId,
      carId,
      slotIndex: idx,
      dataUrl,
      updatedAt: now,
    });
  });

  try {
    await Promise.all(firestoreWrites);
  } catch (err: any) {
    console.error('Firestore cloud photo write error:', err);
    throw new Error('Failed to upload photos to cloud database: ' + (err?.message || String(err)));
  }

  // 3. Asynchronously push to GitHub repository so photos are also committed in git
  pushPhotosToGitHub(carId, compressedUrls).catch((e) => {
    console.warn('GitHub backup push notice:', e);
  });

  return compressedUrls;
}

/**
 * Delete a specific photo slot from both Firestore Cloud and IndexedDB
 */
export async function deleteVehiclePhotoFromCloud(
  carId: string,
  slotIndex: number,
  existingImages: string[]
): Promise<string[]> {
  const updated = existingImages.filter((_, idx) => idx !== slotIndex);
  await setCarUploadedImages(carId, updated);

  // Re-write remaining slots to Firestore
  try {
    // Delete the removed slot
    const removedDocId = `${carId}_${existingImages.length - 1}`;
    await deleteDoc(doc(db, VEHICLE_PHOTOS_COLLECTION, removedDocId)).catch(() => {});

    // Update remaining slots
    const now = new Date().toISOString();
    await Promise.all(
      updated.map((url, idx) =>
        setDoc(doc(db, VEHICLE_PHOTOS_COLLECTION, `${carId}_${idx}`), {
          id: `${carId}_${idx}`,
          carId,
          slotIndex: idx,
          dataUrl: url,
          updatedAt: now,
        })
      )
    );
  } catch (e) {
    console.warn('Error syncing delete to Firestore:', e);
  }

  return updated;
}

/**
 * Re-order photos (e.g., make a slot the Cover Photo)
 */
export async function makePhotoCoverInCloud(
  carId: string,
  slotIndex: number,
  existingImages: string[]
): Promise<string[]> {
  if (slotIndex <= 0 || slotIndex >= existingImages.length) return existingImages;
  const target = existingImages[slotIndex];
  const remaining = existingImages.filter((_, idx) => idx !== slotIndex);
  const reordered = [target, ...remaining];

  await setCarUploadedImages(carId, reordered);

  // Re-write to Firestore
  try {
    const now = new Date().toISOString();
    await Promise.all(
      reordered.map((url, idx) =>
        setDoc(doc(db, VEHICLE_PHOTOS_COLLECTION, `${carId}_${idx}`), {
          id: `${carId}_${idx}`,
          carId,
          slotIndex: idx,
          dataUrl: url,
          updatedAt: now,
        })
      )
    );
  } catch (e) {
    console.warn('Error updating cover in Firestore:', e);
  }

  return reordered;
}

/**
 * Scans local IndexedDB and syncs all cars with local photos up to Firestore Cloud & GitHub!
 * Solves the issue where user already uploaded on their laptop and wants them published live.
 */
export async function syncAllLocalPhotosToCloud(
  onProgress?: (info: { totalCars: number; completedCars: number; currentCarName: string }) => void
): Promise<{ totalCars: number; totalPhotos: number }> {
  const localMap = await getAllUploadedImagesMap();
  const carIds = Object.keys(localMap).filter((id) => localMap[id] && localMap[id].length > 0);

  let totalPhotos = 0;
  const now = new Date().toISOString();

  for (let i = 0; i < carIds.length; i++) {
    const carId = carIds[i];
    const images = localMap[carId];

    if (onProgress) {
      onProgress({
        totalCars: carIds.length,
        completedCars: i,
        currentCarName: carId,
      });
    }

    // Write each image to Firestore
    const writes = images.map((dataUrl, idx) => {
      const docId = `${carId}_${idx}`;
      return setDoc(doc(db, VEHICLE_PHOTOS_COLLECTION, docId), {
        id: docId,
        carId,
        slotIndex: idx,
        dataUrl,
        updatedAt: now,
      });
    });

    await Promise.all(writes);
    totalPhotos += images.length;

    // Asynchronously push to GitHub
    pushPhotosToGitHub(carId, images).catch((e) => console.warn('GitHub push notice:', e));
  }

  if (onProgress) {
    onProgress({
      totalCars: carIds.length,
      completedCars: carIds.length,
      currentCarName: 'All Done!',
    });
  }

  return { totalCars: carIds.length, totalPhotos };
}

/**
 * Checks how many photos/cars are currently stored in local IndexedDB
 */
export async function getLocalUploadsStats(): Promise<{ carCount: number; photoCount: number; carIds: string[] }> {
  try {
    const map = await getAllUploadedImagesMap();
    const carIds = Object.keys(map).filter((k) => map[k] && map[k].length > 0);
    let photoCount = 0;
    carIds.forEach((id) => {
      photoCount += map[id].length;
    });
    return { carCount: carIds.length, photoCount, carIds };
  } catch {
    return { carCount: 0, photoCount: 0, carIds: [] };
  }
}

/**
 * Generates and downloads a .zip file containing all uploaded car photos
 * organized in folders by car name.
 */
export async function downloadAllUploadedPhotosAsZip(
  vehicles: Car[],
  onProgress?: (percent: number) => void
): Promise<void> {
  const zip = new JSZip();

  // Combine Firestore cloud photos and local IndexedDB photos
  const localMap = await getAllUploadedImagesMap();
  let cloudSnapshotDocs: CloudPhotoRecord[] = [];

  try {
    const snap = await getDocs(collection(db, VEHICLE_PHOTOS_COLLECTION));
    cloudSnapshotDocs = snap.docs.map((d) => d.data() as CloudPhotoRecord);
  } catch (e) {
    console.warn('Could not read cloud docs for zip:', e);
  }

  const combinedMap: Record<string, string[]> = { ...localMap };
  cloudSnapshotDocs.forEach((d) => {
    if (d.carId && d.dataUrl) {
      if (!combinedMap[d.carId]) combinedMap[d.carId] = [];
      combinedMap[d.carId][d.slotIndex] = d.dataUrl;
    }
  });

  const carIdsWithPhotos = Object.keys(combinedMap).filter((id) => combinedMap[id] && combinedMap[id].length > 0);
  if (carIdsWithPhotos.length === 0) {
    throw new Error('No uploaded photos found to download.');
  }

  const vehicleMap = new Map(vehicles.map((v) => [v.id, v]));

  for (const carId of carIdsWithPhotos) {
    const vehicle = vehicleMap.get(carId);
    const folderName = vehicle
      ? `${vehicle.make}_${vehicle.model.replace(/[\/\\:*?"<>|]/g, '_')}_${vehicle.year}`
      : carId;

    const folder = zip.folder(folderName);
    const photos = combinedMap[carId].filter(Boolean);

    photos.forEach((dataUrl, idx) => {
      // Extract base64 content
      const base64Index = dataUrl.indexOf('base64,');
      if (base64Index !== -1) {
        const rawBase64 = dataUrl.slice(base64Index + 7);
        folder?.file(`photo-${idx + 1}.jpg`, rawBase64, { base64: true });
      }
    });
  }

  const blob = await zip.generateAsync({ type: 'blob' }, (metadata) => {
    if (onProgress) onProgress(Math.round(metadata.percent));
  });

  // Trigger browser download
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `bako-cars-showroom-photos-${new Date().toISOString().slice(0, 10)}.zip`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Pushes photos directly to GitHub repository public folder via GitHub Contents API
 */
async function pushPhotosToGitHub(carId: string, photos: string[]): Promise<void> {
  const token = getGitHubToken();
  if (!token || photos.length === 0) return;

  for (let i = 0; i < photos.length; i++) {
    const dataUrl = photos[i];
    const base64Idx = dataUrl.indexOf('base64,');
    if (base64Idx === -1) continue;
    const content = dataUrl.slice(base64Idx + 7);
    const path = `public/cars/${carId}/photo-${i + 1}.jpg`;

    try {
      // Check if file exists to get SHA for update
      let sha: string | undefined;
      const getRes = await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
        {
          headers: {
            Authorization: `token ${token}`,
            'User-Agent': 'BakoCars',
          },
        }
      );
      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo.sha;
      }

      // Commit file to GitHub
      await fetch(
        `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`,
        {
          method: 'PUT',
          headers: {
            Authorization: `token ${token}`,
            'Content-Type': 'application/json',
            'User-Agent': 'BakoCars',
          },
          body: JSON.stringify({
            message: `Upload showroom photo ${i + 1} for ${carId}`,
            content,
            sha,
            branch: 'main',
          }),
        }
      );
    } catch (e) {
      console.warn(`GitHub upload notice for ${path}:`, e);
    }
  }
}
