import { useMemo } from 'react';
import { useEvents } from '../../hooks/useEvents';
import { EmptyState } from '../common';
import EventCard from './EventCard';

interface EventListProps {
  filter?: 'all' | 'upcoming' | 'past';
}

export default function EventList({ filter = 'all' }: EventListProps) {
  const { events, loading } = useEvents();

  const filteredEvents = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    let filtered = [...events];

    if (filter === 'upcoming') {
      filtered = filtered.filter((e) => e.date >= today);
    } else if (filter === 'past') {
      filtered = filtered.filter((e) => e.date < today);
    }

    // Sort by date
    filtered.sort((a, b) => {
      if (filter === 'past') {
        return b.date.localeCompare(a.date); // Past: most recent first
      }
      return a.date.localeCompare(b.date); // Upcoming/all: soonest first
    });

    return filtered;
  }, [events, filter]);

  if (loading) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="h-24 bg-gray-100 rounded-lg animate-pulse" />
        ))}
      </div>
    );
  }

  if (filteredEvents.length === 0) {
    return (
      <EmptyState
        icon={
          <svg className="w-16 h-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
        }
        title={filter === 'past' ? 'No past events' : filter === 'upcoming' ? 'No upcoming events' : 'No events yet'}
        description={filter === 'upcoming' ? 'Plan your outfit for an upcoming event.' : 'Start planning outfits for your events.'}
      />
    );
  }

  return (
    <div className="space-y-3">
      {filteredEvents.map((event) => (
        <EventCard key={event.id} event={event} />
      ))}
    </div>
  );
}
