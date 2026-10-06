/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

// IndexedDB storage for car photography uploaded directly from user's laptop
const DB_NAME = 'bako_cars_uploads_db';
const DB_VERSION = 1;
const STORE_NAME = 'car_photos';

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB not supported in this environment'));
      return;
    }

    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'carId' });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

/**
 * Converts a file to an optimized, high-performance compressed base64 data URL
 * Ensures images easily fit in Firestore cloud documents (< 1MB) and load instantly.
 */
export function fileToDataUrl(file: File, maxDim = 1440, quality = 0.82): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const rawDataUrl = e.target?.result as string;
      if (!file.type.startsWith('image/')) {
        resolve(rawDataUrl);
        return;
      }

      const img = new Image();
      img.onload = () => {
        let width = img.width;
        let height = img.height;

        if (width > maxDim || height > maxDim) {
          if (width > height) {
            height = Math.round((height * maxDim) / width);
            width = maxDim;
          } else {
            width = Math.round((width * maxDim) / height);
            height = maxDim;
          }
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          resolve(rawDataUrl);
          return;
        }

        ctx.imageSmoothingEnabled = true;
        ctx.imageSmoothingQuality = 'high';
        ctx.drawImage(img, 0, 0, width, height);

        // High efficiency JPEG compression for fast transfer & Firestore persistence
        const compressed = canvas.toDataURL('image/jpeg', quality);
        resolve(compressed);
      };
      img.onerror = () => resolve(rawDataUrl);
      img.src = rawDataUrl;
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(file);
  });
}

/**
 * Get all uploaded image data URLs for a given car
 */
export async function getCarUploadedImages(carId: string): Promise<string[]> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.get(carId);

      request.onsuccess = () => {
        const record = request.result;
        resolve(record && Array.isArray(record.images) ? record.images : []);
      };

      request.onerror = () => {
        console.warn('Could not read from IndexedDB for car', carId);
        resolve([]);
      };
    });
  } catch (err) {
    console.warn('IndexedDB not available:', err);
    return [];
  }
}

/**
 * Set full image list for a car directly in IndexedDB
 */
export async function setCarUploadedImages(carId: string, images: string[]): Promise<string[]> {
  try {
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction(STORE_NAME, 'readwrite');
      const store = tx.objectStore(STORE_NAME);
      const putReq = store.put({ carId, images, updatedAt: new Date().toISOString() });

      putReq.onsuccess = () => resolve(images);
      putReq.onerror = () => reject(putReq.error);
    });
  } catch (err) {
    console.error('Failed to set images in IndexedDB:', err);
    return images;
  }
}

/**
 * Batch upload multiple images at once (up to 12)
 * Assigns them in the EXACT order they were selected/uploaded by the user.
 * Allows specifying the target count (1 to 12).
 */
export async function batchUploadCarImages(
  carId: string,
  files: File[] | FileList,
  maxCount: number = 12
): Promise<string[]> {
  const limit = Math.min(Math.max(maxCount, 1), 12);
  const filesArray = Array.from(files)
    .filter((f) => f.type.startsWith('image/'))
    .slice(0, limit);

  if (filesArray.length === 0) {
    return getCarUploadedImages(carId);
  }

  // Preserve exact selection order using Promise.all
  const dataUrls = await Promise.all(filesArray.map((file) => fileToDataUrl(file)));

  // Save to IndexedDB
  await setCarUploadedImages(carId, dataUrls);
  return dataUrls;
}

/**
 * Replace or set a single slot index (0 to 7) with a newly uploaded photo
 * Leaves other slots intact so the user can make changes one by one.
 */
export async function updateCarSingleSlot(
  carId: string,
  slotIndex: number,
  file: File,
  existingImages: string[] = []
): Promise<string[]> {
  const dataUrl = await fileToDataUrl(file);
  const current = existingImages.length > 0 ? [...existingImages] : await getCarUploadedImages(carId);

  if (slotIndex < current.length) {
    current[slotIndex] = dataUrl;
  } else {
    while (current.length < slotIndex) {
      current.push('');
    }
    current[slotIndex] = dataUrl;
  }

  const cleaned = current.filter(Boolean);
  await setCarUploadedImages(carId, cleaned);
  return cleaned;
}

/**
 * Delete a specific slot index (0 to 7)
 */
export async function deleteCarSlot(
  carId: string,
  slotIndex: number,
  existingImages: string[] = []
): Promise<string[]> {
  const current = existingImages.length > 0 ? [...existingImages] : await getCarUploadedImages(carId);
  const updated = current.filter((_, idx) => idx !== slotIndex);
  await setCarUploadedImages(carId, updated);
  return updated;
}

/**
 * Move a specific photo slot to Slot 1 (Make Cover Photo)
 */
export async function makeSlotCover(
  carId: string,
  slotIndex: number,
  existingImages: string[] = []
): Promise<string[]> {
  const current = existingImages.length > 0 ? [...existingImages] : await getCarUploadedImages(carId);
  if (slotIndex <= 0 || slotIndex >= current.length) return current;

  const target = current[slotIndex];
  const remaining = current.filter((_, idx) => idx !== slotIndex);
  const reordered = [target, ...remaining];

  await setCarUploadedImages(carId, reordered);
  return reordered;
}

/**
 * Get a map of all uploaded images keyed by carId
 */
export async function getAllUploadedImagesMap(): Promise<Record<string, string[]>> {
  try {
    const db = await openDB();
    return new Promise((resolve) => {
      const tx = db.transaction(STORE_NAME, 'readonly');
      const store = tx.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        const records = request.result || [];
        const map: Record<string, string[]> = {};
        records.forEach((rec: { carId: string; images: string[] }) => {
          if (rec.carId && Array.isArray(rec.images) && rec.images.length > 0) {
            map[rec.carId] = rec.images;
          }
        });
        resolve(map);
      };

      request.onerror = () => resolve({});
    });
  } catch (err) {
    console.warn('IndexedDB error:', err);
    return {};
  }
}

/**
 * Backward compatibility: Add uploaded images to a car
 */
export async function addCarUploadedImages(carId: string, files: File[]): Promise<string[]> {
  return batchUploadCarImages(carId, files);
}
