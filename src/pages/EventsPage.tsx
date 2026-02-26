import { useState } from 'react';
import { Button, Modal } from '../components/common';
import { EventForm, EventList } from '../components/events';

type FilterType = 'upcoming' | 'past' | 'all';

export default function EventsPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [filter, setFilter] = useState<FilterType>('upcoming');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Event Planner</h1>
        <Button onClick={() => setIsAddModalOpen(true)}>
          <svg className="w-5 h-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Add Event
        </Button>
      </div>

      <div className="flex gap-2">
        {(['upcoming', 'past', 'all'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition-colors ${
              filter === f
                ? 'bg-indigo-100 text-indigo-700'
                : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <EventList filter={filter} />

      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add Event">
        <EventForm onClose={() => setIsAddModalOpen(false)} />
      </Modal>
    </div>
  );
}
