interface CalendarCellProps {
  date: Date;
  hasEvent?: boolean;
  className?: string;
  onClick?: () => void;
}

/**
 * CalendarCell
 * ------------
 * Single day square used in month view.
 * - White background by default
 * - Light purple background + dot indicator if the day has events
 */
export default function CalendarCell({
  date,
  hasEvent = false,
  className = 'w-16 h-16',
  onClick,
}: CalendarCellProps) {
  const dayNumber = date.getDate();

  return (
    <div
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center border rounded-md cursor-pointer hover:bg-purple-200 transition-colors ${
        hasEvent ? 'bg-purple-100' : 'bg-white'
      } ${className}`}
    >
      <span className="text-lg font-medium">{dayNumber}</span>
      {hasEvent && (
        <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-3 h-3 rounded-full bg-purple-600 border border-white shadow" />
      )}
    </div>
  );
}
