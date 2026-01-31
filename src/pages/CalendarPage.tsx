import { useState } from 'react';
import WearCalendar from '../components/tracking/WearCalendar';
import WearLogForm from '../components/tracking/WearLogForm';
import QuickWearButton from '../components/tracking/QuickWearButton';
import { Modal } from '../components/common';

export default function CalendarPage() {
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [isQuickWearOpen, setIsQuickWearOpen] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Wear Calendar</h1>
      </div>

      <WearCalendar onSelectDate={setSelectedDate} />

      <Modal
        isOpen={!!selectedDate}
        onClose={() => setSelectedDate(null)}
        title={selectedDate ? `Log Wear for ${new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}` : ''}
        size="lg"
      >
        {selectedDate && (
          <WearLogForm date={selectedDate} onClose={() => setSelectedDate(null)} />
        )}
      </Modal>

      <Modal
        isOpen={isQuickWearOpen}
        onClose={() => setIsQuickWearOpen(false)}
        title="Quick Log Today's Wear"
        size="lg"
      >
        <WearLogForm
          date={new Date().toISOString().split('T')[0]}
          onClose={() => setIsQuickWearOpen(false)}
        />
      </Modal>

      <QuickWearButton onClick={() => setIsQuickWearOpen(true)} />
    </div>
  );
}
