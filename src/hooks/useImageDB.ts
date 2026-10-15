import { useState, useEffect } from 'react';
import { getImage, type StoredImage } from '../services/storage/indexedDB';
import { blobToDataURL } from '../services/imageService';
import { useAuth } from '../contexts/AuthContext';
import { getSignedImageUrl } from '../services/wardrobeSupabase';

export function useImageURL(imageId: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const [setAt, setSetAt] = useState<number>(0);
  const [timer, setTimer] = useState<number | null>(null);

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
          setSetAt(Date.now());
          // Refresh 60s before 1h TTL
          const handle = window.setTimeout(async () => {
            if (!mounted) return;
            const refreshed = await getSignedImageUrl(user.id!, imageId, false);
            if (refreshed && mounted) {
              setUrl(refreshed);
              setSetAt(Date.now());
            }
          }, (3600 - 60) * 1000);
          setTimer(handle);
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
      if (timer) window.clearTimeout(timer);
    };
  }, [imageId, user?.id]);

  // Refresh on tab visibility return if near/after expiry
  useEffect(() => {
    if (!user || !imageId) return;
    const onVis = async () => {
      if (document.visibilityState === 'visible') {
        const ageSec = (Date.now() - setAt) / 1000;
        if (ageSec > 3500) {
          const refreshed = await getSignedImageUrl(user.id!, imageId, false);
          if (refreshed) {
            setUrl(refreshed);
            setSetAt(Date.now());
          }
        }
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [user?.id, imageId, setAt]);

  return url;
}

export function useThumbnailURL(imageId: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);
  const { user } = useAuth();
  const [setAt, setSetAt] = useState<number>(0);
  const [timer, setTimer] = useState<number | null>(null);

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
          setSetAt(Date.now());
          const handle = window.setTimeout(async () => {
            if (!mounted) return;
            const refreshed = await getSignedImageUrl(user.id!, imageId, true);
            if (refreshed && mounted) {
              setUrl(refreshed);
              setSetAt(Date.now());
            }
          }, (3600 - 60) * 1000);
          setTimer(handle);
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
      if (timer) window.clearTimeout(timer);
    };
  }, [imageId, user?.id]);

  useEffect(() => {
    if (!user || !imageId) return;
    const onVis = async () => {
      if (document.visibilityState === 'visible') {
        const ageSec = (Date.now() - setAt) / 1000;
        if (ageSec > 3500) {
          const refreshed = await getSignedImageUrl(user.id!, imageId, true);
          if (refreshed) {
            setUrl(refreshed);
            setSetAt(Date.now());
          }
        }
      }
    };
    document.addEventListener('visibilitychange', onVis);
    return () => document.removeEventListener('visibilitychange', onVis);
  }, [user?.id, imageId, setAt]);

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
