import { useState, useMemo } from 'react';
import { useEffect } from 'react';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import clsx from 'clsx';
import { format, subDays, isToday } from 'date-fns';

/* --- dummy data helper --------------------------------------------------- */
type ShiftLog = {
  id: number;
  staffName: string;
  startedAt: string; // ISO
  endedAt: string;
  notes: string;
};
const makeFakeLogs = (): ShiftLog[] => {
  const out: ShiftLog[] = [];
  let id = 1;
  for (let d = 0; d < 14; d++) {
    const day = subDays(new Date(), d);
    const start = new Date(day.setHours(7, 0, 0, 0));
    out.push({
      id: id++,
      staffName: 'Maya Lopez',
      startedAt: start.toISOString(),
      endedAt: new Date(start.getTime() + 8 * 3600_000).toISOString(),
      notes: 'All scheduled meds administered.',
    });
    out.push({
      id: id++,
      staffName: 'Josh Brown',
      startedAt: new Date(start.getTime() + 8 * 3600_000).toISOString(),
      endedAt: new Date(start.getTime() + 16 * 3600_000).toISOString(),
      notes: 'Incident #17 — fall reported.',
    });
  }
  return out;
};

/* ------------------------------------------------------------------------ */

export default function ShiftLogHandler() {
  const [filter, setFilter] = useState<'today' | 'custom'>('today');
  const [startDate, setStartDate] = useState<string>(''); // ISO yyyy‑mm‑dd
  const [endDate, setEndDate] = useState<string>('');
  // --- responsive list height -------------------------------------------
  const [listHeight, setListHeight] = useState<number>(400);
  useEffect(() => {
    const update = () => {
      const vh = typeof window !== 'undefined' ? window.innerHeight : 800;
      /* leave ~220px for header + paddings */
      setListHeight(Math.max(240, vh - 220));
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);
  const allLogs = useMemo(() => makeFakeLogs(), []);
  const filtered = useMemo(() => {
    //const today = new Date();
    return allLogs.filter(log => {
      const dt = new Date(log.startedAt);
      if (filter === 'today') return isToday(dt);
      // no "yesterday" or "this week" now
      if (filter === 'custom' && startDate && endDate) {
        const from = new Date(startDate);
        const to = new Date(endDate);
        to.setHours(23, 59, 59, 999);
        return dt >= from && dt <= to;
      }
      return false;
    });
  }, [allLogs, filter, startDate, endDate]);

  /* virtualised row renderer */
  const Row = ({ index, style }: ListChildComponentProps) => {
    const log = filtered[index];
    const dateStr = format(new Date(log.startedAt), 'EEE • dd MMM yyyy');
    const timeStr = `${format(new Date(log.startedAt), 'HH:mm')}–${format(
      new Date(log.endedAt),
      'HH:mm'
    )}`;

    return (
      <div style={style} className="border-b px-4 py-2 flex flex-col bg-white hover:bg-gray-50">
        <span className="text-xs text-gray-500">{dateStr}</span>
        <div className="flex items-baseline justify-between">
          <span className="font-medium">{log.staffName}</span>
          <span className="text-sm text-gray-600">{timeStr}</span>
        </div>
        <p className="text-sm text-gray-700">{log.notes}</p>
      </div>
    );
  };

  return (
    <section className="h-full flex flex-col">
      <h1 className="text-2xl font-bold text-purple-700 mb-4">Shift&nbsp;Logs</h1>
      {/* Filter header */}
      <div className="mb-2 flex flex-wrap gap-2">
        {(['today', 'custom'] as const).map(key => (
          <button
            key={key}
            onClick={() => {
              setFilter(key);
              if (key !== 'custom') {
                setStartDate('');
                setEndDate('');
              }
            }}
            className={clsx(
              'rounded-md px-3 py-1.5 text-sm font-medium',
              filter === key
                ? 'bg-purple-600 text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            )}
          >
            {key === 'today' ? 'Today' : 'Custom'}
          </button>
        ))}

        {/* Reset button */}
        <button
          type="button"
          onClick={() => {
            setFilter('today');
            setStartDate('');
            setEndDate('');
          }}
          className="ml-auto rounded-md px-3 py-1.5 text-sm font-medium bg-gray-200 text-gray-800 hover:bg-gray-300"
        >
          Reset
        </button>
      </div>

      {filter === 'custom' && (
        <div className="mb-3 flex flex-col sm:flex-row items-start sm:items-center gap-2">
          <input
            type="date"
            value={startDate}
            onChange={e => setStartDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
          />
          <span className="text-sm">to</span>
          <input
            type="date"
            value={endDate}
            onChange={e => setEndDate(e.target.value)}
            className="border rounded px-2 py-1 text-sm w-full sm:w-auto"
          />
          <button
            type="button"
            onClick={() => {
              /* trigger memo recompute by just setting state noop */
              setStartDate(startDate);
            }}
            className="rounded-md bg-purple-600 text-white px-3 py-1.5 text-sm"
          >
            Apply
          </button>
        </div>
      )}

      {/* Virtualised list */}
      <div className="flex-1 border rounded-md overflow-hidden">
        <List height={listHeight} itemCount={filtered.length} itemSize={88} width="100%">
          {Row}
        </List>
      </div>

      {/* Placeholder load‑more button */}
      <button className="mt-3 self-center text-sm text-purple-600 hover:underline">
        Load older logs…
      </button>
    </section>
  );
}
