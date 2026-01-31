import { useState, useMemo } from 'react';
import { useWearLog } from '../../hooks/useWearLog';
import { Button } from '../common';
import CalendarDay from './CalendarDay';

interface WearCalendarProps {
  onSelectDate: (date: string) => void;
}

const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];

export default function WearCalendar({ onSelectDate }: WearCalendarProps) {
  const { wearLogs } = useWearLog();
  const [currentDate, setCurrentDate] = useState(new Date());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const wearCountByDate = useMemo(() => {
    const counts = new Map<string, number>();
    wearLogs.forEach((log) => {
      const current = counts.get(log.date) || 0;
      counts.set(log.date, current + 1);
    });
    return counts;
  }, [wearLogs]);

  const calendarDays = useMemo(() => {
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const startOffset = firstDay.getDay();
    const daysInMonth = lastDay.getDate();

    // Get previous month's trailing days
    const prevMonthLastDay = new Date(year, month, 0).getDate();
    const prevMonthDays = Array.from({ length: startOffset }, (_, i) => ({
      date: new Date(year, month - 1, prevMonthLastDay - startOffset + i + 1),
      isCurrentMonth: false,
    }));

    // Current month days
    const currentMonthDays = Array.from({ length: daysInMonth }, (_, i) => ({
      date: new Date(year, month, i + 1),
      isCurrentMonth: true,
    }));

    // Next month's leading days
    const totalDays = prevMonthDays.length + currentMonthDays.length;
    const nextMonthDays = Array.from({ length: 42 - totalDays }, (_, i) => ({
      date: new Date(year, month + 1, i + 1),
      isCurrentMonth: false,
    }));

    return [...prevMonthDays, ...currentMonthDays, ...nextMonthDays];
  }, [year, month]);

  const goToPrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const goToNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const formatDateString = (date: Date) => {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
  };

  const today = formatDateString(new Date());

  return (
    <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200">
        <div className="flex items-center gap-2">
          <button
            onClick={goToPrevMonth}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={goToNextMonth}
            className="p-1.5 hover:bg-gray-100 rounded-lg transition-colors"
          >
            <svg className="w-5 h-5 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        <h2 className="text-lg font-semibold text-gray-900">
          {MONTHS[month]} {year}
        </h2>

        <Button variant="outline" size="sm" onClick={goToToday}>
          Today
        </Button>
      </div>

      <div className="grid grid-cols-7 border-b border-gray-200">
        {DAYS_OF_WEEK.map((day) => (
          <div key={day} className="px-2 py-2 text-center text-xs font-medium text-gray-500 uppercase">
            {day}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {calendarDays.map(({ date, isCurrentMonth }, idx) => {
          const dateStr = formatDateString(date);
          const wearCount = wearCountByDate.get(dateStr) || 0;
          const isToday = dateStr === today;

          return (
            <CalendarDay
              key={idx}
              date={date}
              isCurrentMonth={isCurrentMonth}
              isToday={isToday}
              wearCount={wearCount}
              onClick={() => onSelectDate(dateStr)}
            />
          );
        })}
      </div>
    </div>
  );
}
