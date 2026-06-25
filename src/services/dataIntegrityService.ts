import * as storage from './storage/localStorage';

export function cleanupItemReferences(itemId: string): void {
  const outfits = storage.getOutfits();
  const updatedOutfits = [];
  for (const outfit of outfits) {
    const remainingItems = outfit.items.filter(item => item.itemId !== itemId);
    if (remainingItems.length >= 2) {
      updatedOutfits.push({ ...outfit, items: remainingItems });
    }
  }
  storage.setOutfits(updatedOutfits);

  const wearLogs = storage.getWearLogs();
  const updatedLogs = [];
  for (const log of wearLogs) {
    const remainingItemIds = log.itemIds.filter(id => id !== itemId);
    if (remainingItemIds.length > 0) {
      updatedLogs.push({ ...log, itemIds: remainingItemIds });
    }
  }
  storage.setWearLogs(updatedLogs);

  const conversations = storage.getConversations();
  const updatedConversations = conversations.map(conv => ({
    ...conv,
    messages: conv.messages.map(msg => {
      if (!msg.referencedItemIds) return msg;
      const filtered = msg.referencedItemIds.filter(id => id !== itemId);
      return {
        ...msg,
        referencedItemIds: filtered.length > 0 ? filtered : undefined,
      };
    }),
  }));
  storage.setConversations(updatedConversations);
}

export function cleanupOutfitReferences(outfitId: string): void {
  const wearLogs = storage.getWearLogs().map(log =>
    log.outfitId === outfitId ? { ...log, outfitId: undefined } : log
  );
  storage.setWearLogs(wearLogs);

  const events = storage.getEvents().map(event =>
    event.outfitId === outfitId ? { ...event, outfitId: undefined } : event
  );
  storage.setEvents(events);
}

export function cleanupStorageSpaceReferences(spaceId: string): void {
  const items = storage.getItems().map(item =>
    item.storageSpaceId === spaceId ? { ...item, storageSpaceId: undefined } : item
  );
  storage.setItems(items);
}

export function repairAllData(): void {
  const itemIds = new Set(storage.getItems().map(item => item.id));
  const spaceIds = new Set(storage.getStorageSpaces().map(space => space.id));

  const repairedOutfits = [];
  for (const outfit of storage.getOutfits()) {
    const validItems = outfit.items.filter(item => itemIds.has(item.itemId));
    if (validItems.length >= 2) {
      repairedOutfits.push({ ...outfit, items: validItems });
    }
  }
  storage.setOutfits(repairedOutfits);

  const validOutfitIds = new Set(repairedOutfits.map(outfit => outfit.id));

  const repairedWearLogs = [];
  for (const log of storage.getWearLogs()) {
    const validItemIds = log.itemIds.filter(id => itemIds.has(id));
    if (validItemIds.length === 0) continue;
    repairedWearLogs.push({
      ...log,
      itemIds: validItemIds,
      outfitId: log.outfitId && validOutfitIds.has(log.outfitId) ? log.outfitId : undefined,
    });
  }
  storage.setWearLogs(repairedWearLogs);

  const repairedEvents = storage.getEvents().map(event => ({
    ...event,
    outfitId: event.outfitId && validOutfitIds.has(event.outfitId) ? event.outfitId : undefined,
  }));
  storage.setEvents(repairedEvents);

  const repairedItems = storage.getItems().map(item => ({
    ...item,
    storageSpaceId: item.storageSpaceId && spaceIds.has(item.storageSpaceId)
      ? item.storageSpaceId
      : undefined,
  }));
  storage.setItems(repairedItems);

  const repairedConversations = storage.getConversations().map(conv => ({
    ...conv,
    messages: conv.messages.map(msg => {
      if (!msg.referencedItemIds) return msg;
      const validRefs = msg.referencedItemIds.filter(id => itemIds.has(id));
      return {
        ...msg,
        referencedItemIds: validRefs.length > 0 ? validRefs : undefined,
      };
    }),
  }));
  storage.setConversations(repairedConversations);
}
