import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useWardrobe } from '../hooks/useWardrobe';
import { useToast } from '../components/common/Toast';
import { Button, Modal } from '../components/common';
import ItemDetail from '../components/wardrobe/ItemDetail';
import ItemForm from '../components/wardrobe/ItemForm';
import type { WardrobeItem } from '../types';

export default function ItemPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { getItem, deleteItem, loading } = useWardrobe();
  const { showToast } = useToast();
  const [editingItem, setEditingItem] = useState<WardrobeItem | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const item = id ? getItem(id) : undefined;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64 text-gray-400">
        <svg className="w-8 h-8 animate-spin" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
        </svg>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <p className="text-gray-500">Item not found.</p>
        <Button variant="outline" onClick={() => navigate('/')}>
          Back to Wardrobe
        </Button>
      </div>
    );
  }

  const handleDelete = async () => {
    try {
      await deleteItem(item.id);
      showToast('Item deleted', 'success');
      navigate('/');
    } catch {
      showToast('Failed to delete item', 'error');
    }
    setShowDeleteConfirm(false);
  };

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-900 transition-colors"
      >
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
        </svg>
        Back
      </button>

      <h1 className="text-2xl font-bold text-gray-900">{item.name}</h1>

      <ItemDetail
        item={item}
        onEdit={() => setEditingItem(item)}
        onDelete={() => setShowDeleteConfirm(true)}
      />

      <Modal
        isOpen={!!editingItem}
        onClose={() => setEditingItem(null)}
        title={`Edit ${item.name}`}
        size="lg"
      >
        {editingItem && <ItemForm onClose={() => setEditingItem(null)} editItem={editingItem} />}
      </Modal>

      <Modal
        isOpen={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        title="Delete Item"
      >
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{item.name}"? This action cannot be undone.
          </p>
          <div className="flex justify-end gap-3">
            <Button variant="outline" onClick={() => setShowDeleteConfirm(false)}>
              Cancel
            </Button>
            <Button variant="danger" onClick={handleDelete}>
              Delete
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
