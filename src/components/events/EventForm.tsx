import { useState, useEffect } from 'react';
import { useEvents } from '../../hooks/useEvents';
import { useOutfits } from '../../hooks/useOutfits';
import { useToast } from '../common/Toast';
import { Button } from '../common';
import { OCCASIONS } from '../../utils/constants';
import type { PlannedEvent, Occasion } from '../../types';

interface EventFormProps {
  onClose: () => void;
  editEvent?: PlannedEvent;
  defaultDate?: string;
}

export default function EventForm({ onClose, editEvent, defaultDate }: EventFormProps) {
  const { addEvent, updateEvent } = useEvents();
  const { outfits } = useOutfits();
  const { showToast } = useToast();

  const [name, setName] = useState('');
  const [date, setDate] = useState(defaultDate || new Date().toISOString().split('T')[0]);
  const [occasion, setOccasion] = useState<Occasion>('casual');
  const [outfitId, setOutfitId] = useState<string>('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!editEvent;

  useEffect(() => {
    if (editEvent) {
      setName(editEvent.name);
      setDate(editEvent.date);
      setOccasion(editEvent.occasion);
      setOutfitId(editEvent.outfitId || '');
      setNotes(editEvent.notes || '');
    }
  }, [editEvent]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      showToast('Please enter an event name', 'error');
      return;
    }

    if (!date) {
      showToast('Please select a date', 'error');
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing) {
        updateEvent(editEvent.id, {
          name: name.trim(),
          date,
          occasion,
          outfitId: outfitId || undefined,
          notes: notes.trim() || undefined,
        });
        showToast('Event updated successfully', 'success');
      } else {
        addEvent({
          name: name.trim(),
          date,
          occasion,
          outfitId: outfitId || undefined,
          notes: notes.trim() || undefined,
        });
        showToast('Event added successfully', 'success');
      }
      onClose();
    } catch (error) {
      showToast(isEditing ? 'Failed to update event' : 'Failed to add event', 'error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Event Name *</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g., Wedding, Job Interview, Date Night"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Occasion *</label>
          <select
            value={occasion}
            onChange={(e) => setOccasion(e.target.value as Occasion)}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            {OCCASIONS.map((occ) => (
              <option key={occ.value} value={occ.value}>
                {occ.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Planned Outfit</label>
        <select
          value={outfitId}
          onChange={(e) => setOutfitId(e.target.value)}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="">No outfit selected</option>
          {outfits.map((outfit) => (
            <option key={outfit.id} value={outfit.id}>
              {outfit.name}
            </option>
          ))}
        </select>
        {outfits.length === 0 && (
          <p className="mt-1 text-xs text-gray-500">
            Create outfits first to assign them to events
          </p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
        <textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Any notes about the event..."
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none"
        />
      </div>

      <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
        <Button type="button" variant="outline" onClick={onClose}>
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? (isEditing ? 'Saving...' : 'Adding...') : (isEditing ? 'Save Changes' : 'Add Event')}
        </Button>
      </div>
    </form>
  );
}
