interface CalendarCellProps {
  date: Date;
  hasEvent?: boolean;
  className?: string;
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
}: CalendarCellProps) {
  const dayNumber = date.getDate();

  return (
    <div
      className={`relative flex flex-col items-center justify-center border rounded-md ${
        hasEvent ? 'bg-purple-100' : 'bg-white'
      } ${className}`}
    >
      <span className="text-lg font-medium">{dayNumber}</span>
      {hasEvent && <span className="absolute bottom-1 w-2 h-2 bg-purple-700 rounded-full" />}
    </div>
  );
}
