import { useState, useEffect } from 'react';
import { getImage, type StoredImage } from '../services/storage/indexedDB';
import { blobToDataURL } from '../services/imageService';
import { useAuth } from '../contexts/AuthContext';
import { getSignedImageUrl } from '../services/wardrobeSupabase';

export function useImageURL(imageId: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!imageId) {
      setUrl(null);
      return;
    }

    let mounted = true;

    // If logged in, prefer Supabase signed URL; else fall back to IndexedDB
    (async () => {
      if (user) {
        const signed = await getSignedImageUrl(user.id, imageId, false);
        if (mounted && signed) {
          setUrl(signed);
          return;
        }
      }
      const image = await getImage(imageId);
      if (mounted && image) {
        const dataUrl = await blobToDataURL(image.data);
        if (mounted) setUrl(dataUrl);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [imageId, user?.id]);

  return url;
}

export function useThumbnailURL(imageId: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!imageId) {
      setUrl(null);
      return;
    }

    let mounted = true;

    (async () => {
      if (user) {
        const signed = await getSignedImageUrl(user.id, imageId, true);
        if (mounted && signed) {
          setUrl(signed);
          return;
        }
      }
      const image = await getImage(imageId);
      if (mounted && image) {
        const dataUrl = await blobToDataURL(image.thumbnail);
        if (mounted) setUrl(dataUrl);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [imageId, user?.id]);

  return url;
}

export function useImage(imageId: string | undefined): StoredImage | null {
  const [image, setImage] = useState<StoredImage | null>(null);
  const { user } = useAuth();

  useEffect(() => {
    if (!imageId) {
      setImage(null);
      return;
    }

    let mounted = true;

    // Note: binary fetch from Supabase is not currently implemented; fall back to local cache
    getImage(imageId).then((img) => {
      if (mounted) setImage(img);
    });

    return () => {
      mounted = false;
    };
  }, [imageId, user?.id]);

  return image;
}
