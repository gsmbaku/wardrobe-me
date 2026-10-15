import { useEffect, useMemo, useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../common/Toast';
import { Button, Card } from '../common';
import * as ls from '../../services/storage/localStorage';
import { getAllImages } from '../../services/storage/indexedDB';
import { addRemoteItem } from '../../services/wardrobeSupabase';

export default function SupabaseImportBanner() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const [visible, setVisible] = useState(false);
  const [isImporting, setIsImporting] = useState(false);

  const flagKey = useMemo(() => (user ? `import-v1-done:${user.id}` : null), [user?.id]);

  useEffect(() => {
    if (!user || !flagKey) return;
    try {
      const hasItems = ls.getItems().length > 0;
      const already = localStorage.getItem(flagKey);
      setVisible(hasItems && !already);
    } catch {
      // ignore
    }
  }, [user?.id, flagKey]);

  if (!user || !visible) return null;

  const handleImport = async () => {
    setIsImporting(true);
    try {
      const localItems = ls.getItems();
      const images = await getAllImages();
      const imageById = new Map(images.map((img) => [img.id, img]));

      let success = 0;
      for (const item of localItems) {
        const img = imageById.get(item.imageId);
        if (!img) continue;
        // Reconstruct File from Blob for API compatibility
        const file = new File([img.data], `${item.imageId}.jpg`, { type: 'image/jpeg' });
        await addRemoteItem(user.id, {
          name: item.name,
          category: item.category,
          color: item.color,
          seasons: item.seasons,
          image: file,
          brand: item.brand,
          purchaseDate: item.purchaseDate,
          price: item.price,
          notes: item.notes,
          size: item.size,
          tags: item.tags,
          fit: item.fit,
          forSale: item.forSale,
          saleLink: item.saleLink,
          storageSpaceId: item.storageSpaceId,
        });
        success++;
      }
      if (flagKey) {
        localStorage.setItem(flagKey, '1');
      }
      showToast(`Imported ${success} item${success === 1 ? '' : 's'} to your account`, 'success');
      // Hard refresh wardrobe items via custom event
      window.dispatchEvent(new CustomEvent('wardrobe-storage-change', { detail: { collections: ['items'] } }));
      setVisible(false);
    } catch (e) {
      showToast('Import failed. Please try again.', 'error');
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Card padding="md" className="mb-4 bg-indigo-50 border border-indigo-200">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <div className="text-sm text-indigo-900">
          You have local wardrobe items on this device. Import them to your account to sync across devices.
        </div>
        <div className="flex gap-2">
          <Button onClick={handleImport} disabled={isImporting}>
            {isImporting ? 'Importing...' : 'Import now'}
          </Button>
          <Button variant="ghost" onClick={() => setVisible(false)}>
            Dismiss
          </Button>
        </div>
      </div>
    </Card>
  );
}

