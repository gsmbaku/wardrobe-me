import { exportAllData, importData, clearAllData } from './storage/localStorage';
import { getAllImages, saveImage, clearAllImages } from './storage/indexedDB';
import { blobToDataURL } from './imageService';

interface ExportData {
  version: number;
  items: unknown[];
  outfits: unknown[];
  wearLogs: unknown[];
  images: Array<{
    id: string;
    data: string;
    thumbnail: string;
    createdAt: string;
  }>;
  exportedAt: string;
}

export async function exportBackup(): Promise<string> {
  const localData = exportAllData();
  const images = await getAllImages();

  // Convert blobs to base64 for JSON storage
  const imagesData = await Promise.all(
    images.map(async (img) => ({
      id: img.id,
      data: await blobToDataURL(img.data),
      thumbnail: await blobToDataURL(img.thumbnail),
      createdAt: img.createdAt,
    }))
  );

  const exportData: ExportData = {
    ...localData,
    images: imagesData,
  };

  return JSON.stringify(exportData, null, 2);
}

export async function downloadBackup(): Promise<void> {
  const data = await exportBackup();
  const blob = new Blob([data], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const a = document.createElement('a');
  a.href = url;
  a.download = `wardrobe-backup-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

function dataURLToBlob(dataURL: string): Blob {
  const parts = dataURL.split(',');
  const mime = parts[0].match(/:(.*?);/)?.[1] || 'image/jpeg';
  const bstr = atob(parts[1]);
  const u8arr = new Uint8Array(bstr.length);
  for (let i = 0; i < bstr.length; i++) {
    u8arr[i] = bstr.charCodeAt(i);
  }
  return new Blob([u8arr], { type: mime });
}

export async function importBackup(file: File): Promise<{ itemCount: number; outfitCount: number; imageCount: number }> {
  const text = await file.text();
  const data = JSON.parse(text) as ExportData;

  // Clear existing data
  clearAllData();
  await clearAllImages();

  // Import localStorage data
  importData({
    items: data.items as Parameters<typeof importData>[0]['items'],
    outfits: data.outfits as Parameters<typeof importData>[0]['outfits'],
    wearLogs: data.wearLogs as Parameters<typeof importData>[0]['wearLogs'],
  });

  // Import images
  if (data.images) {
    for (const img of data.images) {
      const dataBlob = dataURLToBlob(img.data);
      const thumbnailBlob = dataURLToBlob(img.thumbnail);
      await saveImage(img.id, dataBlob, thumbnailBlob);
    }
  }

  return {
    itemCount: data.items?.length || 0,
    outfitCount: data.outfits?.length || 0,
    imageCount: data.images?.length || 0,
  };
}
