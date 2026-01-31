interface CalendarDayProps {
  date: Date;
  isCurrentMonth: boolean;
  isToday: boolean;
  wearCount: number;
  onClick: () => void;
}

export default function CalendarDay({
  date,
  isCurrentMonth,
  isToday,
  wearCount,
  onClick,
}: CalendarDayProps) {
  return (
    <button
      onClick={onClick}
      className={`relative h-16 md:h-20 border-b border-r border-gray-100 p-1 text-left hover:bg-gray-50 transition-colors ${
        !isCurrentMonth ? 'bg-gray-50' : ''
      }`}
    >
      <span
        className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-sm ${
          isToday
            ? 'bg-indigo-600 text-white font-medium'
            : isCurrentMonth
            ? 'text-gray-900'
            : 'text-gray-400'
        }`}
      >
        {date.getDate()}
      </span>

      {wearCount > 0 && (
        <div className="absolute bottom-1 left-1 right-1 flex justify-center gap-0.5">
          {Array.from({ length: Math.min(wearCount, 3) }).map((_, i) => (
            <div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-green-500"
            />
          ))}
          {wearCount > 3 && (
            <span className="text-[10px] text-green-600 font-medium">+{wearCount - 3}</span>
          )}
        </div>
      )}
    </button>
  );
}
