import { useState } from 'react';
import { useEvents } from '../../hooks/useEvents';
import { useOutfits } from '../../hooks/useOutfits';
import { useToast } from '../common/Toast';
import { Card, Button, Modal } from '../common';
import EventForm from './EventForm';
import type { PlannedEvent } from '../../types';
import { OCCASIONS } from '../../utils/constants';

interface EventCardProps {
  event: PlannedEvent;
}

export default function EventCard({ event }: EventCardProps) {
  const { deleteEvent } = useEvents();
  const { getOutfit } = useOutfits();
  const { showToast } = useToast();
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const occasionLabel = OCCASIONS.find((o) => o.value === event.occasion)?.label || event.occasion;
  const outfit = event.outfitId ? getOutfit(event.outfitId) : null;
  const eventDate = new Date(event.date);
  const isUpcoming = eventDate >= new Date(new Date().toISOString().split('T')[0]);

  const handleDelete = () => {
    deleteEvent(event.id);
    showToast('Event deleted', 'success');
    setShowDeleteConfirm(false);
  };

  const occasionColors: Record<string, string> = {
    casual: 'bg-blue-100 text-blue-700',
    work: 'bg-gray-100 text-gray-700',
    formal: 'bg-purple-100 text-purple-700',
    date: 'bg-pink-100 text-pink-700',
    party: 'bg-yellow-100 text-yellow-700',
    travel: 'bg-green-100 text-green-700',
    workout: 'bg-orange-100 text-orange-700',
    other: 'bg-gray-100 text-gray-700',
  };

  return (
    <>
      <Card className={`${!isUpcoming ? 'opacity-60' : ''}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h3 className="font-medium text-gray-900 truncate">{event.name}</h3>
              <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${occasionColors[event.occasion] || occasionColors.other}`}>
                {occasionLabel}
              </span>
            </div>
            <p className="text-sm text-gray-600">
              {eventDate.toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
                year: eventDate.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
              })}
            </p>
            {outfit && (
              <p className="text-sm text-indigo-600 mt-1">
                Outfit: {outfit.name}
              </p>
            )}
            {event.notes && (
              <p className="text-sm text-gray-500 mt-1 line-clamp-2">{event.notes}</p>
            )}
          </div>

          <div className="flex gap-2">
            <button
              onClick={() => setShowEditModal(true)}
              className="p-1.5 text-gray-400 hover:text-gray-600 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(true)}
              className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
            >
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>
      </Card>

      <Modal isOpen={showEditModal} onClose={() => setShowEditModal(false)} title="Edit Event">
        <EventForm editEvent={event} onClose={() => setShowEditModal(false)} />
      </Modal>

      <Modal isOpen={showDeleteConfirm} onClose={() => setShowDeleteConfirm(false)} title="Delete Event">
        <div className="space-y-4">
          <p className="text-gray-600">
            Are you sure you want to delete "{event.name}"? This action cannot be undone.
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
    </>
  );
}
