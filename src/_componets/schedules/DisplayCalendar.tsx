'use client';

import { useMemo } from 'react';
import { parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import CalendarCell from '@/_componets/schedules/CalendarCell';
import { Schedule } from '@/interfaces/scheduleInterface';

interface DisplayCalendarProps {
  /** Month to display (defaults to today) */
  date?: Date;
  /** Schedules to highlight on the calendar */
  schedules?: Schedule[];
}

export function DisplayCalendar({ date = new Date(), schedules = [] }: DisplayCalendarProps) {
  const year = date.getFullYear();
  const month = date.getMonth();

  // normalize: accept either Schedule[] or { schedules: Schedule[] }
  const scheduleList: Schedule[] = Array.isArray(schedules)
    ? schedules
    : ((schedules as any)?.schedules ?? []);

  // Days that contain at least one schedule in this month
  const eventDays = useMemo(() => {
    const set = new Set<number>();
    if (scheduleList.length) {
      scheduleList.forEach((s) => {
        const startUtc =
          typeof s.start_time === 'string' ? parseISO(s.start_time) : new Date(s.start_time);
        const start = toZonedTime(startUtc, 'America/Edmonton'); // force MDT
        if (start.getFullYear() === year && start.getMonth() === month) {
          set.add(start.getDate());
        }
      });
    }
    return set;
  }, [scheduleList, year, month]);

  const monthName = date.toLocaleString('default', { month: 'long' });

  /** Returns all Date objects for the given month */
  const daysInMonth = useMemo(() => {
    const days: Date[] = [];
    const date = new Date(year, month, 1);
    while (date.getMonth() === month) {
      days.push(new Date(date));
      date.setDate(date.getDate() + 1);
    }
    return days;
  }, [year, month]);

  // Calculate leading/trailing empty cells for 7×6 grid
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sun
  const leadingEmpty = Array.from({ length: firstWeekday });
  const totalCells = 42;
  const trailingEmpty = Array.from({
    length: totalCells - (leadingEmpty.length + daysInMonth.length),
  });
  console.log(scheduleList);
  // ⬇︎ add just below the eventDays useMemo
  console.log(
    'eventDays (MDT):',
    [...eventDays].sort((a, b) => a - b)
  );
  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  return (
    <div className="w-full max-w-none p-4 bg-purple-50 rounded-lg shadow-md">
      {/* Month header */}
      <h2 className="text-center text-2xl font-semibold text-purple-700 mb-4">
        {monthName}&nbsp;{year}
      </h2>

      {/* Weekday labels */}
      <div className="grid grid-cols-7 w-full gap-2 text-center text-sm font-medium text-purple-700 mb-2">
        {weekDays.map((d) => (
          <span key={d} className="flex justify-center">
            {d}
          </span>
        ))}
      </div>

      {/* Calendar grid */}
      <div className="grid grid-cols-7 w-full gap-2">
        {leadingEmpty.map((_, idx) => (
          <div key={`lead-${idx}`} className="aspect-square" />
        ))}

        {daysInMonth.map((day) => (
          <CalendarCell
            key={day.toISOString()}
            date={day}
            hasEvent={eventDays.has(day.getDate())}
            className="aspect-square w-full"
          />
        ))}

        {trailingEmpty.map((_, idx) => (
          <div key={`trail-${idx}`} className="aspect-square" />
        ))}
      </div>
    </div>
  );
}

export default DisplayCalendar;
