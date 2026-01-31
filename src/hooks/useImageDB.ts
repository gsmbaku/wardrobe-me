import { useState, useEffect } from 'react';
import { getImage, type StoredImage } from '../services/storage/indexedDB';
import { blobToDataURL } from '../services/imageService';

export function useImageURL(imageId: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageId) {
      setUrl(null);
      return;
    }

    let mounted = true;

    getImage(imageId).then((image) => {
      if (mounted && image) {
        blobToDataURL(image.data).then((dataUrl) => {
          if (mounted) setUrl(dataUrl);
        });
      }
    });

    return () => {
      mounted = false;
    };
  }, [imageId]);

  return url;
}

export function useThumbnailURL(imageId: string | undefined): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!imageId) {
      setUrl(null);
      return;
    }

    let mounted = true;

    getImage(imageId).then((image) => {
      if (mounted && image) {
        blobToDataURL(image.thumbnail).then((dataUrl) => {
          if (mounted) setUrl(dataUrl);
        });
      }
    });

    return () => {
      mounted = false;
    };
  }, [imageId]);

  return url;
}

export function useImage(imageId: string | undefined): StoredImage | null {
  const [image, setImage] = useState<StoredImage | null>(null);

  useEffect(() => {
    if (!imageId) {
      setImage(null);
      return;
    }

    let mounted = true;

    getImage(imageId).then((img) => {
      if (mounted) setImage(img);
    });

    return () => {
      mounted = false;
    };
  }, [imageId]);

  return image;
}
