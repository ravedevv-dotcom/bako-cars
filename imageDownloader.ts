/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import JSZip from 'jszip';
import { Car, getImageUrl } from './types';

/**
 * Downloads a single image to the user device.
 */
export async function downloadSingleImage(url: string, suggestedFilename: string): Promise<boolean> {
  try {
    if (url.startsWith('data:') || url.startsWith('blob:')) {
      const link = document.createElement('a');
      link.href = url;
      link.download = suggestedFilename || 'vehicle-photo.jpg';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      return true;
    }

    const response = await fetch(url, { mode: 'cors' });
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`);
    }

    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = blobUrl;
    link.download = suggestedFilename || 'vehicle-photo.jpg';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    setTimeout(() => URL.revokeObjectURL(blobUrl), 1000);
    return true;
  } catch (err) {
    console.warn('Direct blob download failed, attempting fallback download link:', err);
    // Fallback: direct anchor with download attribute or new tab
    const link = document.createElement('a');
    link.href = url;
    link.target = '_blank';
    link.download = suggestedFilename || 'vehicle-photo.jpg';
    link.rel = 'noopener noreferrer';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    return false;
  }
}

/**
 * Downloads all photos of a vehicle packaged neatly inside a single .ZIP archive.
 */
export async function downloadAllVehicleImages(
  car: Car,
  onProgress?: (current: number, total: number, message: string) => void
): Promise<void> {
  if (!car.images || car.images.length === 0) {
    throw new Error('This vehicle has no images to download.');
  }

  const zip = new JSZip();
  const total = car.images.length;
  const carSlug = `${car.year}-${car.make}-${car.model}`.replace(/[^a-zA-Z0-9]+/g, '-').replace(/^-|-$/g, '');
  const zipFolderName = `${carSlug}-BakoCars`;
  const folder = zip.folder(zipFolderName) || zip;

  let downloadedCount = 0;

  for (let i = 0; i < total; i++) {
    const rawPath = car.images[i];
    const url = getImageUrl(rawPath, 1600);
    
    if (onProgress) {
      onProgress(i + 1, total, `Downloading photo ${i + 1} of ${total}...`);
    }

    // Handle base64 data URLs directly from laptop uploads
    if (rawPath.startsWith('data:') || url.startsWith('data:')) {
      const dataStr = rawPath.startsWith('data:') ? rawPath : url;
      const match = dataStr.match(/^data:image\/([a-zA-Z0-9+.-]+);base64,(.+)$/);
      if (match) {
        const rawExt = match[1];
        const ext = rawExt.includes('png') ? 'png' : rawExt.includes('webp') ? 'webp' : 'jpg';
        const base64Data = match[2];
        const fileName = `${String(i + 1).padStart(2, '0')}-photo.${ext}`;
        folder.file(fileName, base64Data, { base64: true });
        downloadedCount++;
        continue;
      }
    }

    try {
      const response = await fetch(url, { mode: 'cors' });
      if (response.ok) {
        const blob = await response.blob();
        
        // Derive clean filename
        let ext = 'jpg';
        if (blob.type.includes('webp')) ext = 'webp';
        else if (blob.type.includes('png')) ext = 'png';

        let baseName = rawPath.split('/').pop() || `photo-${i + 1}`;
        baseName = baseName.replace(/\.[a-zA-Z0-9]+$/, '');
        // Clean special characters
        baseName = baseName.replace(/[^a-zA-Z0-9_ -]/g, '').trim();
        
        const fileName = `${String(i + 1).padStart(2, '0')}-${baseName}.${ext}`;
        folder.file(fileName, blob);
        downloadedCount++;
      } else {
        console.warn(`Could not fetch image index ${i}:`, response.statusText);
      }
    } catch (e) {
      console.warn(`Error downloading image index ${i}:`, e);
    }
  }

  if (downloadedCount === 0) {
    throw new Error('Unable to download vehicle photos due to network restrictions.');
  }

  if (onProgress) {
    onProgress(total, total, 'Generating ZIP package...');
  }

  const zipBlob = await zip.generateAsync(
    {
      type: 'blob',
      compression: 'DEFLATE',
      compressionOptions: { level: 6 },
    },
    (metadata) => {
      if (onProgress && metadata.percent) {
        onProgress(total, total, `Compressing photos: ${Math.round(metadata.percent)}%`);
      }
    }
  );

  const zipUrl = URL.createObjectURL(zipBlob);
  const link = document.createElement('a');
  link.href = zipUrl;
  link.download = `${zipFolderName}.zip`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  setTimeout(() => URL.revokeObjectURL(zipUrl), 2000);
}
