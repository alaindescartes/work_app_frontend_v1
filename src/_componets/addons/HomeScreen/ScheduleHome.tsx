'use client';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { useGetSchedulesQuery } from '@/redux/slices/scheduleSlice';

import { format, startOfToday } from 'date-fns';
import { Schedule } from '@/interfaces/scheduleInterface';

interface SchedulesResponse {
  schedules: Schedule[];
}

type ScheduleHomeProps = {
  resident_id: number;
  resident_fNma: string;
  resident_lName: string;
};

export default function ScheduleHome(props: ScheduleHomeProps) {
  const homeId = useSelector((state: RootState) => state.grouphome.grouphomeInfo.id);

  const { data: schedules } = useGetSchedulesQuery(homeId, {
    /* auto‑refresh when tab gains focus, or every 60 s */
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    pollingInterval: 130_000,
  });

  // API may deliver Schedule[] directly or { schedules: Schedule[] }
  const list: Schedule[] = (() => {
    if (!schedules) return [];
    if (Array.isArray(schedules)) return schedules as Schedule[];
    if ('schedules' in schedules && Array.isArray((schedules as SchedulesResponse).schedules)) {
      return (schedules as SchedulesResponse).schedules;
    }
    return [];
  })();

  /* Filter schedules for this resident only */
  const residentSchedules = list.filter((s: Schedule) => s.residentId === props.resident_id);

  /* Only keep schedules that end today or in the future */
  const today = startOfToday();
  const upcoming = residentSchedules.filter(
    (s: Schedule) => new Date(s.end_time).valueOf() >= today.valueOf()
  );

  if (upcoming.length === 0) {
    return (
      <p className="rounded bg-yellow-50 px-4 py-2 text-sm text-yellow-700 shadow-sm">
        No schedules coming up for the rest of today.
      </p>
    );
  }

  return (
    <ul className="space-y-4">
      {upcoming.map((s: Schedule) => (
        <li
          key={s.id}
          className="flex flex-col h-full rounded-xl border border-indigo-200 bg-white/90 p-5 shadow-md transition hover:shadow-lg"
        >
          {/* Header */}
          <div className="mb-3 flex items-start justify-between">
            <h4 className="text-lg font-semibold text-indigo-700">{s.title ?? s.schedule_type}</h4>
            <span className="rounded bg-indigo-100 px-2 py-0.5 text-xs font-medium text-indigo-700">
              {s.schedule_type}
            </span>
          </div>
          <div className="mb-3 h-px w-full bg-indigo-100" />

          {/* Date + time */}
          <p className="mb-2 text-sm text-gray-600">
            <span className="font-medium">{format(new Date(s.start_time), 'MMM d, yyyy • p')}</span>
            <br />
            <span className="text-xs">to&nbsp;{format(new Date(s.end_time), 'p')}</span>
          </p>

          {/* Description */}
          <p className="mb-3 flex-1 text-sm text-gray-700">{s.description ?? '-'}</p>

          {/* Footer */}
          <p className="text-xs text-gray-500">
            Client:&nbsp;
            <span className="font-medium">
              {props.resident_fNma} {props.resident_lName}
            </span>
          </p>
        </li>
      ))}
    </ul>
  );
}
