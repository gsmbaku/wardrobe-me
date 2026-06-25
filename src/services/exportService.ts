import { exportAllData, importData, clearAllData } from './storage/localStorage';
import { getAllImages, saveImage, clearAllImages } from './storage/indexedDB';
import { blobToDataURL } from './imageService';
import { repairAllData } from './dataIntegrityService';
import { BACKUP_FORMAT_VERSION } from '../utils/constants';
import type {
  WardrobeItem,
  Outfit,
  WearLogEntry,
  Note,
  StorageSpace,
  PlannedEvent,
  Conversation,
} from '../types';

interface BackupImage {
  id: string;
  data: string;
  thumbnail: string;
  createdAt: string;
}

export interface BackupData {
  formatVersion: number;
  storageVersion: number;
  items: WardrobeItem[];
  outfits: Outfit[];
  wearLogs: WearLogEntry[];
  notes: Note[];
  storageSpaces: StorageSpace[];
  events: PlannedEvent[];
  conversations: Conversation[];
  images: BackupImage[];
  exportedAt: string;
}

export interface ImportResult {
  itemCount: number;
  outfitCount: number;
  wearLogCount: number;
  noteCount: number;
  storageSpaceCount: number;
  eventCount: number;
  conversationCount: number;
  imageCount: number;
}

export async function exportBackup(): Promise<string> {
  const localData = exportAllData();
  const images = await getAllImages();

  const imagesData = await Promise.all(
    images.map(async (img) => ({
      id: img.id,
      data: await blobToDataURL(img.data),
      thumbnail: await blobToDataURL(img.thumbnail),
      createdAt: img.createdAt,
    }))
  );

  const exportData: BackupData = {
    formatVersion: BACKUP_FORMAT_VERSION,
    storageVersion: localData.version,
    items: localData.items,
    outfits: localData.outfits,
    wearLogs: localData.wearLogs,
    notes: localData.notes,
    storageSpaces: localData.storageSpaces,
    events: localData.events,
    conversations: localData.conversations,
    images: imagesData,
    exportedAt: localData.exportedAt,
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

function parseBackupData(raw: unknown): BackupData {
  const data = (raw ?? {}) as Partial<BackupData> & { version?: number };
  const isV1 = data.formatVersion === undefined;

  return {
    formatVersion: isV1 ? 1 : (data.formatVersion ?? 1),
    storageVersion: data.storageVersion ?? data.version ?? 1,
    items: data.items ?? [],
    outfits: data.outfits ?? [],
    wearLogs: data.wearLogs ?? [],
    notes: data.notes ?? [],
    storageSpaces: data.storageSpaces ?? [],
    events: data.events ?? [],
    conversations: data.conversations ?? [],
    images: data.images ?? [],
    exportedAt: data.exportedAt ?? new Date().toISOString(),
  };
}

export async function importBackup(file: File): Promise<ImportResult> {
  const text = await file.text();
  const raw = JSON.parse(text);
  const data = parseBackupData(raw);

  clearAllData();
  await clearAllImages();

  importData({
    items: data.items,
    outfits: data.outfits,
    wearLogs: data.wearLogs,
    notes: data.notes,
    storageSpaces: data.storageSpaces,
    events: data.events,
    conversations: data.conversations,
  });

  if (data.images) {
    for (const img of data.images) {
      const dataBlob = dataURLToBlob(img.data);
      const thumbnailBlob = dataURLToBlob(img.thumbnail);
      await saveImage(img.id, dataBlob, thumbnailBlob);
    }
  }

  repairAllData();

  return {
    itemCount: data.items.length,
    outfitCount: data.outfits.length,
    wearLogCount: data.wearLogs.length,
    noteCount: data.notes.length,
    storageSpaceCount: data.storageSpaces.length,
    eventCount: data.events.length,
    conversationCount: data.conversations.length,
    imageCount: data.images.length,
  };
}
