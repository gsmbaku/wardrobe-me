import { getSupabase } from './supabaseClient';
import type { WardrobeItem, Category, Season, Fit } from '../types';
import { compressImage, generateThumbnail } from './imageService';

const BUCKET = 'item-photos';

function imagePath(uid: string, imageId: string): string {
  return `${uid}/${imageId}.jpg`;
}
function thumbPath(uid: string, imageId: string): string {
  return `${uid}/thumb_${imageId}.jpg`;
}

export async function listRemoteItems(): Promise<WardrobeItem[]> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  const { data, error } = await supabase
    .from('items')
    .select('*')
    .order('created_at', { ascending: true });
  if (error) throw error;
  return (data ?? []).map(row => ({
    id: row.id,
    name: row.name,
    category: row.category as Category,
    color: row.color,
    seasons: row.seasons as Season[],
    imageId: row.image_id,
    brand: row.brand ?? undefined,
    purchaseDate: row.purchase_date ?? undefined,
    price: row.price ?? undefined,
    notes: row.notes ?? undefined,
    storageSpaceId: row.storage_space_id ?? undefined,
    size: row.size ?? undefined,
    tags: (row.tags as string[] | null) ?? undefined,
    fit: row.fit as Fit | null ?? undefined,
    forSale: row.for_sale ?? undefined,
    saleLink: row.sale_link ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }));
}

export async function addRemoteItem(uid: string, data: {
  name: string;
  category: Category;
  color: string;
  seasons: Season[];
  image: File;
  brand?: string;
  purchaseDate?: string;
  price?: number;
  notes?: string;
  size?: string;
  tags?: string[];
  fit?: Fit;
  forSale?: boolean;
  saleLink?: string;
  storageSpaceId?: string;
}): Promise<WardrobeItem> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  // Prepare image assets
  const compressed = await compressImage(data.image);
  const thumbnail = await generateThumbnail(compressed);
  const imageId = crypto.randomUUID();
  const originalKey = imagePath(uid, imageId);
  const thumbKey = thumbPath(uid, imageId);

  // Upload images (upsert)
  const bucket = supabase.storage.from(BUCKET);
  const [u1, u2] = await Promise.all([
    bucket.upload(originalKey, compressed, { upsert: true, contentType: 'image/jpeg', cacheControl: '31536000' }),
    bucket.upload(thumbKey, thumbnail, { upsert: true, contentType: 'image/jpeg', cacheControl: '31536000' }),
  ]);
  if (u1.error) throw u1.error;
  if (u2.error) throw u2.error;

  // Insert row
  const now = new Date().toISOString();
  const { data: inserted, error } = await supabase
    .from('items')
    .insert({
      name: data.name,
      category: data.category,
      color: data.color,
      seasons: data.seasons,
      image_id: imageId,
      brand: data.brand ?? null,
      purchase_date: data.purchaseDate ?? null,
      price: data.price ?? null,
      notes: data.notes ?? null,
      storage_space_id: data.storageSpaceId ?? null,
      size: data.size ?? null,
      tags: data.tags ?? null,
      fit: data.fit ?? null,
      for_sale: data.forSale ?? null,
      sale_link: data.saleLink ?? null,
      created_at: now,
      updated_at: now,
    })
    .select('*')
    .single();
  if (error) throw error;

  return {
    id: inserted.id,
    name: inserted.name,
    category: inserted.category as Category,
    color: inserted.color,
    seasons: inserted.seasons as Season[],
    imageId: inserted.image_id,
    brand: inserted.brand ?? undefined,
    purchaseDate: inserted.purchase_date ?? undefined,
    price: inserted.price ?? undefined,
    notes: inserted.notes ?? undefined,
    storageSpaceId: inserted.storage_space_id ?? undefined,
    size: inserted.size ?? undefined,
    tags: (inserted.tags as string[] | null) ?? undefined,
    fit: inserted.fit as Fit | null ?? undefined,
    forSale: inserted.for_sale ?? undefined,
    saleLink: inserted.sale_link ?? undefined,
    createdAt: inserted.created_at,
    updatedAt: inserted.updated_at,
  };
}

export async function updateRemoteItem(uid: string, id: string, updates: Partial<Omit<WardrobeItem, 'id' | 'imageId' | 'createdAt'>>, image?: File): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');

  // If image provided, fetch current imageId first
  let imageId: string | null = null;
  if (image) {
    const { data, error } = await supabase.from('items').select('image_id').eq('id', id).single();
    if (error) throw error;
    imageId = data.image_id as string;
    const compressed = await compressImage(image);
    const thumbnail = await generateThumbnail(compressed);
    const bucket = supabase.storage.from(BUCKET);
    const [u1, u2] = await Promise.all([
      bucket.upload(imagePath(uid, imageId), compressed, { upsert: true, contentType: 'image/jpeg', cacheControl: '31536000' }),
      bucket.upload(thumbPath(uid, imageId), thumbnail, { upsert: true, contentType: 'image/jpeg', cacheControl: '31536000' }),
    ]);
    if (u1.error) throw u1.error;
    if (u2.error) throw u2.error;
  }

  const dbUpdates: Record<string, unknown> = {
    name: updates.name,
    category: updates.category,
    color: updates.color,
    seasons: updates.seasons,
    brand: updates.brand ?? null,
    purchase_date: updates.purchaseDate ?? null,
    price: updates.price ?? null,
    notes: updates.notes ?? null,
    storage_space_id: updates.storageSpaceId ?? null,
    size: updates.size ?? null,
    tags: updates.tags ?? null,
    fit: updates.fit ?? null,
    for_sale: updates.forSale ?? null,
    sale_link: updates.saleLink ?? null,
    updated_at: new Date().toISOString(),
  };

  // Remove undefined keys so Supabase doesn't set them to null
  Object.keys(dbUpdates).forEach((k) => dbUpdates[k] === undefined && delete dbUpdates[k]);

  const { error } = await supabase.from('items').update(dbUpdates).eq('id', id);
  if (error) throw error;
}

export async function deleteRemoteItem(uid: string, id: string): Promise<void> {
  const supabase = getSupabase();
  if (!supabase) throw new Error('Supabase not configured');
  // Fetch image id to delete assets
  const { data: row, error: selErr } = await supabase.from('items').select('image_id').eq('id', id).single();
  if (selErr) throw selErr;
  const imageId = row.image_id as string;
  const bucket = supabase.storage.from(BUCKET);
  // Best-effort deletion of images
  await bucket.remove([imagePath(uid, imageId), thumbPath(uid, imageId)]);
  const { error } = await supabase.from('items').delete().eq('id', id);
  if (error) throw error;
}

export async function getSignedImageUrl(uid: string, imageId: string, isThumb: boolean, expiresInSeconds = 3600): Promise<string | null> {
  const supabase = getSupabase();
  if (!supabase) return null;
  const key = isThumb ? thumbPath(uid, imageId) : imagePath(uid, imageId);
  const { data, error } = await supabase.storage.from(BUCKET).createSignedUrl(key, expiresInSeconds);
  if (error) return null;
  return data?.signedUrl ?? null;
}

