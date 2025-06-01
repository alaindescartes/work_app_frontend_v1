'use client';

import { useMemo, useState, useEffect } from 'react';
import { parseISO } from 'date-fns';
import { toZonedTime } from 'date-fns-tz';
import CalendarCell from '@/_componets/schedules/CalendarCell';
import { Schedule } from '@/interfaces/scheduleInterface';
import {
  Drawer,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useUpdateScheduleMutation } from '@/redux/slices/scheduleSlice';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toast } from 'sonner';

interface DisplayCalendarProps {
  /** Month to display (defaults to today) */
  date?: Date;
  /** Schedules to highlight on the calendar */
  schedules?: Schedule[];
}

export function DisplayCalendar({ date = new Date(), schedules = [] }: DisplayCalendarProps) {
  // ‑‑ current month being viewed (initialised from prop) ‑‑
  const [viewDate, setViewDate] = useState<Date>(date);
  const year = viewDate.getFullYear();
  const month = viewDate.getMonth();
  const staffId = useSelector((state: RootState) => state.user.userInfo.staffId);

  // Normalize schedules once and memoize so it doesn't change on every render
  const scheduleList: Schedule[] = useMemo(() => {
    if (Array.isArray(schedules)) return schedules;
    const obj = schedules as { schedules?: Schedule[] };
    return obj.schedules ?? [];
  }, [schedules]);
  const curretHome = useSelector((state: RootState) => state.grouphome);
  const residents = curretHome.residents;

  // Resolve residentId → "First Last"
  const getResidentName = (id: number) => {
    const res = residents.find((r) => r.id === id);
    return res ? `${res.firstName} ${res.lastName}` : 'Unknown resident';
  };

  // writable copy so we can do optimistic updates without mutating frozen props
  const [localSchedules, setLocalSchedules] = useState<Schedule[]>(scheduleList);

  // keep in sync if parent prop changes
  useEffect(() => {
    setLocalSchedules(scheduleList);
  }, [scheduleList]);

  // Days that contain at least one schedule in this month
  const eventDays = useMemo(() => {
    const set = new Set<number>();
    if (localSchedules.length) {
      localSchedules.forEach((s) => {
        const startUtc =
          typeof s.start_time === 'string' ? parseISO(s.start_time) : new Date(s.start_time);
        const start = toZonedTime(startUtc, 'America/Edmonton'); // force MDT
        if (start.getFullYear() === year && start.getMonth() === month) {
          set.add(start.getDate());
        }
      });
    }
    return set;
  }, [localSchedules, year, month]);

  const monthName = viewDate.toLocaleString('default', { month: 'long' });

  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [open, setOpen] = useState(false);
  const [updateSchedule, { isLoading: isUpdating }] = useUpdateScheduleMutation();

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

  //handle completion or cancellation of a schedule
  const handleScheduleCompleteOrCancellation = async (
    scheduleId: number,
    status: 'completed' | 'canceled'
  ) => {
    const toastId = toast.loading('Updating schedule...');

    try {
      await updateSchedule({
        id: scheduleId,
        staffId,
        patch: { status },
      }).unwrap();
      // optimistic local update
      setLocalSchedules((prev) =>
        prev.map((sch) => (sch.id === scheduleId ? { ...sch, status } : sch))
      );
      toast.success('', {
        id: toastId,
        description: `Schedule ${status} updated`,
        style: { background: '#16a34a', color: '#fff' }, // green
      });
    } catch (err) {
      toast.error('', {
        id: toastId,
        description: 'Update failed',
        style: { background: '#dc2626', color: '#fff' }, // red
      });
      if (process.env.NEXT_PUBLIC_NODE_ENV !== 'production')
        console.error(`Failed to mark schedule ${status}:`, err);
    }
  };

  // Calculate leading/trailing empty cells for 7×6 grid
  const firstWeekday = new Date(year, month, 1).getDay(); // 0 = Sun
  const leadingEmpty = Array.from({ length: firstWeekday });
  const totalCells = 42;
  const trailingEmpty = Array.from({
    length: totalCells - (leadingEmpty.length + daysInMonth.length),
  });

  const weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Compute schedules for the selected day
  const daySchedules = useMemo(() => {
    if (!selectedDay) return [];
    const yy = selectedDay.getFullYear();
    const mm = selectedDay.getMonth();
    const dd = selectedDay.getDate();

    return localSchedules.filter((s) => {
      const startUtc =
        typeof s.start_time === 'string' ? parseISO(s.start_time) : new Date(s.start_time);
      const start = toZonedTime(startUtc, 'America/Edmonton');
      return start.getFullYear() === yy && start.getMonth() === mm && start.getDate() === dd;
    });
  }, [selectedDay, localSchedules]);

  return (
    <div className="w-full max-w-none p-4 bg-purple-50 rounded-lg shadow-md">
      {/* Month header */}
      <div className="flex items-center justify-between mb-4">
        <button
          type="button"
          className="rounded-full p-1 text-purple-700 hover:bg-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onClick={() => {
            setViewDate(new Date(year, month - 1, 1));
            setSelectedDay(null);
          }}
          aria-label="Previous month"
        >
          &lt;
        </button>

        <h2 className="text-center text-2xl font-semibold text-purple-700">
          {monthName}&nbsp;{year}
        </h2>

        <button
          type="button"
          className="rounded-full p-1 text-purple-700 hover:bg-purple-200/50 focus:outline-none focus:ring-2 focus:ring-purple-500"
          onClick={() => {
            setViewDate(new Date(year, month + 1, 1));
            setSelectedDay(null);
          }}
          aria-label="Next month"
        >
          &gt;
        </button>
      </div>

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
          <Drawer
            key={day.toISOString()}
            open={open && selectedDay?.getTime() === day.getTime()}
            onOpenChange={setOpen}
          >
            <DrawerTrigger asChild>
              <CalendarCell
                date={day}
                hasEvent={eventDays.has(day.getDate())}
                className="aspect-square w-full "
                onClick={() => {
                  setSelectedDay(day);
                  setOpen(true);
                }}
              />
            </DrawerTrigger>

            <DrawerContent className="h-[80vh] rounded-t-2xl bg-white shadow-2xl ring-1 ring-purple-100">
              <DrawerHeader>
                <DrawerTitle>{selectedDay?.toDateString()}</DrawerTitle>
                <DrawerDescription>
                  {daySchedules.length
                    ? `${daySchedules.length} schedule${daySchedules.length > 1 ? 's' : ''}`
                    : 'No schedules for this day'}
                </DrawerDescription>
              </DrawerHeader>

              {/* List of schedules */}
              <div className="space-y-3 px-4 pb-4 max-h-[55vh] overflow-y-auto scrollbar-thin scrollbar-thumb-purple-300/70 scrollbar-thumb-rounded">
                {daySchedules.map((s) => (
                  <div
                    key={s.id}
                    className={`relative border rounded-lg p-4 pr-5 shadow-sm transition-shadow 
                      ${
                        s.status === 'completed'
                          ? 'bg-green-50 border-green-300 opacity-75 pointer-events-none font-extrabold'
                          : s.status === 'canceled'
                            ? 'bg-red-50 border-red-300 opacity-75 pointer-events-none font-extrabold'
                            : 'bg-white hover:shadow-md'
                      }
                      ${
                        s.schedule_type === 'appointment'
                          ? 'border-l-4 border-blue-500/70'
                          : s.schedule_type === 'daily-care'
                            ? 'border-l-4 border-green-500/70'
                            : 'border-l-4 border-indigo-500/70'
                      }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex flex-col">
                        <span className="font-semibold text-purple-700">{s.title}</span>
                        <span className="text-xs text-gray-500">
                          {getResidentName(s.residentId)}
                        </span>
                      </div>

                      <div className="flex gap-2">
                        {/* type badge */}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                            s.schedule_type === 'appointment'
                              ? 'bg-blue-100 text-blue-700'
                              : s.schedule_type === 'daily-care'
                                ? 'bg-green-100 text-green-700'
                                : 'bg-indigo-100 text-indigo-700'
                          }`}
                        >
                          {s.schedule_type}
                        </span>

                        {/* status badge */}
                        <span
                          className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                            s.status === 'completed'
                              ? 'bg-green-100 text-green-700'
                              : s.status === 'canceled'
                                ? 'bg-red-100 text-red-700'
                                : 'bg-gray-100 text-gray-700'
                          }`}
                        >
                          {s.status}
                        </span>
                      </div>
                    </div>
                    <p className="text-sm text-gray-600 mt-1 line-clamp-2">{s.description}</p>
                    <hr className="my-2 border-dashed border-purple-100" />
                    <p className="text-xs text-gray-500">
                      {new Date(s.start_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                      {' – '}
                      {new Date(s.end_time).toLocaleTimeString([], {
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>
                    {s.status === 'scheduled' && (
                      <div className="flex gap-2 mt-2">
                        <Button
                          size="sm"
                          disabled={isUpdating}
                          className="cursor-pointer bg-green-600 text-white hover:bg-green-700 focus:ring-2 focus:ring-green-400"
                          onClick={() => handleScheduleCompleteOrCancellation(s.id, 'completed')}
                        >
                          {isUpdating ? 'Completing...' : 'Complete'}
                        </Button>
                        <Button
                          size="sm"
                          disabled={isUpdating}
                          className="cursor-pointer bg-red-600 text-white hover:bg-red-700 focus:ring-2 focus:ring-red-400"
                          onClick={() => handleScheduleCompleteOrCancellation(s.id, 'canceled')}
                        >
                          {isUpdating ? 'Cancelling...' : 'Cancel  '}
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              <DrawerFooter>
                <Button variant="outline" onClick={() => setOpen(false)}>
                  Close
                </Button>
              </DrawerFooter>
            </DrawerContent>
          </Drawer>
        ))}

        {trailingEmpty.map((_, idx) => (
          <div key={`trail-${idx}`} className="aspect-square" />
        ))}
      </div>
    </div>
  );
}

export default DisplayCalendar;
