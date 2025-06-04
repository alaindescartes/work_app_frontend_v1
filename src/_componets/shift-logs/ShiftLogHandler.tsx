import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import clsx from 'clsx';
import { format, isToday } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toast } from 'sonner';
import { json } from 'node:stream/consumers';

/** Raw row returned from the API */
interface ShiftLogApi {
  id: number;
  home_id: number;
  staff_id: number;
  staffFirstName: string;
  staffLastName: string;
  resident_id: number | null;
  shift_start: string;
  shift_end: string;
  created_at: string;
  is_critical: boolean;
  note: string;
}

export default function ShiftLogHandler() {
  const [filter, setFilter] = useState<'today' | 'custom'>('today');
  const [startDate, setStartDate] = useState<string>(''); // ISO yyyy‑mm‑dd
  const [endDate, setEndDate] = useState<string>('');
  const currentHomeId = useSelector((s: RootState) => s.grouphome.grouphomeInfo.id);
  const currentStaffId = useSelector((s: RootState) => s.user.userInfo.staffId);

  const [allLogs, setAllLogs] = useState<ShiftLogApi[]>([]);
  const [loading, setLoading] = useState<boolean>(false);

  const [editingLog, setEditingLog] = useState<ShiftLogApi | null>(null);
  const noteRef = useRef<HTMLTextAreaElement>(null);
  const criticalRef = useRef<HTMLInputElement>(null);

  /* fetch logs on mount / home change */
  useEffect(() => {
    if (!currentHomeId) return;
    const fetchLogs = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/shift-logs/logs/${currentHomeId}`,
          { credentials: 'include' }
        );
        if (res.ok) {
          const json = await res.json();
          setAllLogs(json.data ?? []);
        } else {
          console.error(await res.text());
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [currentHomeId]);

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

  const filtered = useMemo(() => {
    return allLogs.filter(log => {
      const dt = new Date(log.shift_start);
      if (filter === 'today') return isToday(dt);
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
    const dateStr = format(new Date(log.shift_start), 'EEE • dd MMM yyyy');
    const timeStr = `${format(new Date(log.shift_start), 'HH:mm')}–${format(
      new Date(log.shift_end),
      'HH:mm'
    )}`;
    const staff = `${log.staffFirstName} ${log.staffLastName}`;

    return (
      <div
        style={style}
        className={clsx(
          'my-4 rounded-md border border-gray-200 px-4 py-4 flex flex-col bg-white hover:bg-gray-50 shadow-md relative',
          log.is_critical && 'border-l-4 border-red-600'
        )}
      >
        <span className="text-xs text-gray-500">{dateStr}</span>
        <div className="flex items-baseline justify-between">
          <span className="font-medium">{staff}</span>
          <span className="text-sm text-gray-600">{timeStr}</span>
        </div>
        <p className="text-sm text-gray-700 whitespace-pre-line">{log.note}</p>

        {/* edit emoji top‑right */}
        {log.staff_id === currentStaffId && (
          <button
            type="button"
            onClick={() => setEditingLog(log)}
            title="Edit log"
            className="absolute -top-1 right-3 text-gray-400 hover:text-purple-600"
          >
            🖋️
          </button>
        )}
      </div>
    );
  };

  /* -------------------- EDIT MODAL -------------------- */
  const updateLog = async () => {
    if (!editingLog) return;
    const payload = {
      note: noteRef.current?.value.trim(),
      is_critical: criticalRef.current?.checked,
    };
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/shift-logs/edit-log/${editingLog.id}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        }
      );
      if (res.ok) {
        // refresh list
        const json = await res.json();
        setAllLogs(prev => prev.map(l => (l.id === json.data.id ? json.data : l)));
        setEditingLog(null);
        toast('successfully edited', { style: { backgroundColor: 'green', color: 'white' } });
      } else {
        const errMsg =
          res.status === 403
            ? 'You may edit only your own shift logs'
            : (await res.text()) || 'Could not edit log';

        toast(errMsg, {
          style: { backgroundColor: '#fbbf24', color: '#1f2937' }, // amber bg, gray‑900 text
        });
      }
    } catch (e) {
      toast('could not edit log', { style: { backgroundColor: 'red', color: 'white' } });
    }
  };

  return (
    <section className="h-full flex flex-col">
      {editingLog &&
        createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full h-full sm:h-auto sm:max-w-2xl rounded-none sm:rounded-lg bg-white p-6 sm:p-8 shadow-lg space-y-4 overflow-y-auto">
              <h2 className="text-lg font-semibold mb-2">Edit Log #{editingLog.id}</h2>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" defaultChecked={editingLog.is_critical} ref={criticalRef} />
                Mark as critical
              </label>

              <textarea
                ref={noteRef}
                defaultValue={editingLog.note}
                rows={5}
                className="w-full border rounded px-3 py-2 text-sm"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setEditingLog(null)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={updateLog}
                  className="rounded-md bg-purple-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
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

      {loading && <p className="text-sm text-gray-500 mb-2">Loading shift logs…</p>}
      {/* Virtualised list */}
      <div className="flex-1 border rounded-md overflow-hidden">
        <List height={listHeight} itemCount={filtered.length} itemSize={104} width="100%">
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
