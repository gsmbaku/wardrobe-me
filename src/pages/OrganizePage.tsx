import { useState, useMemo } from 'react';
import { useWardrobe } from '../hooks/useWardrobe';
import { useWearLog } from '../hooks/useWearLog';
import { useStorageSpaces } from '../hooks/useStorageSpaces';
import { useToast } from '../components/common/Toast';
import { Button, Card, Modal } from '../components/common';
import { generateSuggestions, getStorageSpaceStats } from '../services/organizerService';
import { STORAGE_SPACE_TYPES, CATEGORIES } from '../utils/constants';
import type { StorageSpace, StorageSpaceType, WardrobeItem } from '../types';

export default function OrganizePage() {
  const { items, updateItem } = useWardrobe();
  const { wearLogs } = useWearLog();
  const { storageSpaces, addStorageSpace, updateStorageSpace, deleteStorageSpace } = useStorageSpaces();
  const { showToast } = useToast();

  const [isSpaceFormOpen, setIsSpaceFormOpen] = useState(false);
  const [editingSpace, setEditingSpace] = useState<StorageSpace | null>(null);
  const [deleteConfirmSpace, setDeleteConfirmSpace] = useState<StorageSpace | null>(null);
  const [expandedSuggestion, setExpandedSuggestion] = useState<string | null>(null);
  const [assigningItems, setAssigningItems] = useState<{ items: WardrobeItem[]; spaceId?: string } | null>(null);

  // Form state
  const [spaceName, setSpaceName] = useState('');
  const [spaceType, setSpaceType] = useState<StorageSpaceType>('hanging');
  const [spaceLocation, setSpaceLocation] = useState('');

  const suggestions = useMemo(
    () => generateSuggestions(items, wearLogs),
    [items, wearLogs]
  );

  const handleOpenNewSpace = () => {
    setEditingSpace(null);
    setSpaceName('');
    setSpaceType('hanging');
    setSpaceLocation('');
    setIsSpaceFormOpen(true);
  };

  const handleOpenEditSpace = (space: StorageSpace) => {
    setEditingSpace(space);
    setSpaceName(space.name);
    setSpaceType(space.type);
    setSpaceLocation(space.location || '');
    setIsSpaceFormOpen(true);
  };

  const handleCloseSpaceForm = () => {
    setIsSpaceFormOpen(false);
    setEditingSpace(null);
  };

  const handleSaveSpace = () => {
    if (!spaceName.trim()) {
      showToast('Please enter a name', 'error');
      return;
    }

    if (editingSpace) {
      updateStorageSpace(editingSpace.id, {
        name: spaceName.trim(),
        type: spaceType,
        location: spaceLocation.trim() || undefined,
      });
      showToast('Storage space updated', 'success');
    } else {
      addStorageSpace({
        name: spaceName.trim(),
        type: spaceType,
        location: spaceLocation.trim() || undefined,
      });
      showToast('Storage space added', 'success');
    }
    handleCloseSpaceForm();
  };

  const handleDeleteSpace = () => {
    if (deleteConfirmSpace) {
      // Clear storage space from items that were assigned to it
      const itemsInSpace = items.filter(item => item.storageSpaceId === deleteConfirmSpace.id);
      for (const item of itemsInSpace) {
        updateItem(item.id, { storageSpaceId: undefined });
      }
      deleteStorageSpace(deleteConfirmSpace.id);
      showToast('Storage space deleted', 'success');
      setDeleteConfirmSpace(null);
    }
  };

  const handleAssignItems = (spaceId: string) => {
    if (assigningItems) {
      for (const item of assigningItems.items) {
        updateItem(item.id, { storageSpaceId: spaceId });
      }
      showToast(`${assigningItems.items.length} item(s) assigned`, 'success');
      setAssigningItems(null);
    }
  };

  const getSpaceTypeInfo = (type: StorageSpaceType) => {
    return STORAGE_SPACE_TYPES.find(t => t.value === type) || STORAGE_SPACE_TYPES[5];
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Organize Your Closet</h1>
        <p className="text-gray-500 mt-1">Manage storage spaces and get organization suggestions</p>
      </div>

      {/* Storage Spaces Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Your Storage Spaces</h2>
          <Button onClick={handleOpenNewSpace} size="sm">+ Add Space</Button>
        </div>

        {storageSpaces.length === 0 ? (
          <Card className="text-center py-8">
            <p className="text-gray-500 mb-4">No storage spaces defined yet</p>
            <Button onClick={handleOpenNewSpace}>Add Your First Space</Button>
          </Card>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {storageSpaces.map((space) => {
              const stats = getStorageSpaceStats(space.id, items);
              const typeInfo = getSpaceTypeInfo(space.type);

              return (
                <Card key={space.id} className="relative">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <span className="text-2xl">{typeInfo.icon}</span>
                      <div>
                        <h3 className="font-medium text-gray-900">{space.name}</h3>
                        <p className="text-sm text-gray-500">{typeInfo.label}</p>
                      </div>
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => handleOpenEditSpace(space)}
                        className="p-1 text-gray-400 hover:text-gray-600"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirmSpace(space)}
                        className="p-1 text-gray-400 hover:text-red-500"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {space.location && (
                    <p className="text-xs text-gray-400 mt-1">📍 {space.location}</p>
                  )}

                  <div className="mt-4 pt-3 border-t border-gray-100">
                    <p className="text-sm font-medium text-gray-700">{stats.itemCount} items</p>
                    {Object.keys(stats.categories).length > 0 && (
                      <div className="flex flex-wrap gap-1 mt-2">
                        {Object.entries(stats.categories).map(([cat, count]) => {
                          const catLabel = CATEGORIES.find(c => c.value === cat)?.label || cat;
                          return (
                            <span key={cat} className="text-xs px-2 py-0.5 bg-gray-100 text-gray-600 rounded-full">
                              {catLabel}: {count}
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </section>

      {/* Suggestions Section */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">Suggestions</h2>
          <span className="text-sm text-gray-500">{suggestions.length} suggestions</span>
        </div>

        {suggestions.length === 0 ? (
          <Card className="text-center py-8">
            <span className="text-4xl mb-4 block">✨</span>
            <p className="text-gray-500">Your closet is well organized! No suggestions at this time.</p>
          </Card>
        ) : (
          <div className="space-y-3">
            {suggestions.map((suggestion) => (
              <Card key={suggestion.id} padding="sm">
                <div
                  className="flex items-start gap-3 cursor-pointer"
                  onClick={() => setExpandedSuggestion(
                    expandedSuggestion === suggestion.id ? null : suggestion.id
                  )}
                >
                  <span className="text-2xl">{suggestion.icon}</span>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-medium text-gray-900">{suggestion.title}</h3>
                    <p className="text-sm text-gray-500">{suggestion.description}</p>
                    {suggestion.suggestedAction && (
                      <p className="text-sm text-indigo-600 mt-1">💡 {suggestion.suggestedAction}</p>
                    )}
                  </div>
                  <svg
                    className={`w-5 h-5 text-gray-400 transition-transform ${
                      expandedSuggestion === suggestion.id ? 'rotate-180' : ''
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </div>

                {expandedSuggestion === suggestion.id && (
                  <div className="mt-4 pt-4 border-t border-gray-100">
                    <div className="flex flex-wrap gap-2 mb-4">
                      {suggestion.items.slice(0, 8).map((item) => (
                        <span
                          key={item.id}
                          className="text-xs px-2 py-1 bg-gray-100 text-gray-700 rounded-full"
                        >
                          {item.name}
                        </span>
                      ))}
                      {suggestion.items.length > 8 && (
                        <span className="text-xs px-2 py-1 bg-gray-100 text-gray-500 rounded-full">
                          +{suggestion.items.length - 8} more
                        </span>
                      )}
                    </div>

                    {suggestion.type === 'unassigned' && storageSpaces.length > 0 && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={(e) => {
                          e.stopPropagation();
                          setAssigningItems({ items: suggestion.items });
                        }}
                      >
                        Assign to Storage Space
                      </Button>
                    )}
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </section>

      {/* Future AI Section Placeholder */}
      <section className="opacity-60">
        <Card className="text-center py-6 border-dashed">
          <span className="text-3xl mb-2 block">🤖</span>
          <p className="text-gray-500 font-medium">AI-Powered Suggestions</p>
          <p className="text-sm text-gray-400 mt-1">Coming soon - get personalized organization advice</p>
        </Card>
      </section>

      {/* Storage Space Form Modal */}
      <Modal
        isOpen={isSpaceFormOpen}
        onClose={handleCloseSpaceForm}
        title={editingSpace ? 'Edit Storage Space' : 'Add Storage Space'}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name *</label>
            <input
              type="text"
              value={spaceName}
              onChange={(e) => setSpaceName(e.target.value)}
              placeholder="e.g., Main Closet Rod, Top Drawer"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
              autoFocus
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Type *</label>
            <div className="grid grid-cols-3 gap-2">
              {STORAGE_SPACE_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setSpaceType(type.value)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-lg border-2 transition-colors ${
                    spaceType === type.value
                      ? 'border-indigo-500 bg-indigo-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <span className="text-xl">{type.icon}</span>
                  <span className="text-xs text-gray-700">{type.label}</span>
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Location (optional)</label>
            <input
              type="text"
              value={spaceLocation}
              onChange={(e) => setSpaceLocation(e.target.value)}
              placeholder="e.g., Bedroom, Hall Closet, Garage"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={handleCloseSpaceForm}>Cancel</Button>
            <Button onClick={handleSaveSpace}>
              {editingSpace ? 'Save Changes' : 'Add Space'}
            </Button>
          </div>
        </div>
      </Modal>

      {/* Delete Confirmation Modal */}
      <Modal
        isOpen={!!deleteConfirmSpace}
        onClose={() => setDeleteConfirmSpace(null)}
        title="Delete Storage Space"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{deleteConfirmSpace?.name}"?
            Items assigned to this space will become unassigned.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setDeleteConfirmSpace(null)}>Cancel</Button>
            <Button variant="danger" onClick={handleDeleteSpace}>Delete</Button>
          </div>
        </div>
      </Modal>

      {/* Assign Items Modal */}
      <Modal
        isOpen={!!assigningItems}
        onClose={() => setAssigningItems(null)}
        title="Assign Items to Storage Space"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Select a storage space for {assigningItems?.items.length} item(s):
          </p>
          <div className="space-y-2">
            {storageSpaces.map((space) => {
              const typeInfo = getSpaceTypeInfo(space.type);
              return (
                <button
                  key={space.id}
                  onClick={() => handleAssignItems(space.id)}
                  className="w-full flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:border-indigo-500 hover:bg-indigo-50 transition-colors text-left"
                >
                  <span className="text-xl">{typeInfo.icon}</span>
                  <div>
                    <p className="font-medium text-gray-900">{space.name}</p>
                    {space.location && (
                      <p className="text-sm text-gray-500">{space.location}</p>
                    )}
                  </div>
                </button>
              );
            })}
          </div>
          <div className="flex justify-end pt-4 border-t border-gray-200">
            <Button variant="outline" onClick={() => setAssigningItems(null)}>Cancel</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
