import { useState, useMemo, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { FixedSizeList as List, ListChildComponentProps } from 'react-window';
import clsx from 'clsx';
import { format, isToday } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toast } from 'sonner';

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

interface ShiftLogInsert {
  home_id: number;
  staff_id: number;
  resident_id?: number | null;
  shift_start: string;
  shift_end: string;
  is_critical?: boolean;
  note: string;
}

export default function ShiftLogHandler() {
  /* helper: current datetime in America/Edmonton formatted as yyyy-MM-ddTHH:mm */
  const getEdmontonNowLocal = () => {
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'America/Edmonton',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    })
      .formatToParts(new Date())
      .reduce<Record<string, string>>((acc, p) => {
        if (p.type !== 'literal') acc[p.type] = p.value;
        return acc;
      }, {});
    return `${parts.year}-${parts.month}-${parts.day}T${parts.hour}:${parts.minute}`;
  };

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

  /* ------------- Add‑Log modal state ---------------- */
  const [showAddModal, setShowAddModal] = useState(false);
  const addNoteRef = useRef<HTMLTextAreaElement>(null);
  const addCriticalRef = useRef<HTMLInputElement>(null);
  const addStartRef = useRef<HTMLInputElement>(null);
  const addEndRef = useRef<HTMLInputElement>(null);

  // fetchLogs hoisted for reuse
  const fetchLogs = async () => {
    if (!currentHomeId) return;
    setLoading(true);
    try {
      let url = `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/shift-logs/logs/${currentHomeId}`;
      if (filter === 'custom' && startDate && endDate) {
        url += `?from=${startDate}&to=${endDate}`;
      }
      const res = await fetch(url, { credentials: 'include' });
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

  /* fetch logs when:
       • today filter is active, OR
       • custom filter has both from/to dates filled.
     Dependency array stays constant length to avoid React warning. */
  useEffect(() => {
    const shouldFetch = filter === 'today' || (filter === 'custom' && startDate && endDate);

    if (shouldFetch) {
      fetchLogs();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentHomeId, filter, startDate, endDate]);

  // --- responsive list height -------------------------------------------
  const [listHeight, setListHeight] = useState<number>(50);
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
    if (filter === 'today') {
      // server already defaults to today, but guard in case
      return allLogs.filter(log => isToday(new Date(log.shift_start)));
    }
    // for custom range the server already provided the filtered list
    return allLogs;
  }, [allLogs, filter]);

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
    } catch (e: unknown) {
      if (process.env.NODE_ENV !== 'production') console.error(e);
      toast('could not edit log', { style: { backgroundColor: 'red', color: 'white' } });
    }
  };

  /* -------------------- ADD LOG -------------------- */
  const saveNewLog = async () => {
    if (!currentHomeId || !currentStaffId) return;

    const payload: ShiftLogInsert = {
      home_id: currentHomeId,
      staff_id: currentStaffId,
      resident_id: null,
      shift_start: addStartRef.current?.value ?? '',
      shift_end: addEndRef.current?.value ?? '',
      is_critical: addCriticalRef.current?.checked ?? false,
      note: addNoteRef.current?.value.trim() ?? '',
    };

    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/api/shift-logs/add-logs`, {
        method: 'POST',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        toast('Log added', { style: { backgroundColor: 'green', color: 'white' } });
        setShowAddModal(false);
        fetchLogs(); // refresh list
      } else {
        toast('Could not add log', { style: { backgroundColor: 'red', color: 'white' } });
        console.error(await res.text());
      }
    } catch (e) {
      console.error(e);
      toast('Error adding log', { style: { backgroundColor: 'red', color: 'white' } });
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
      {showAddModal &&
        createPortal(
          <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/50 backdrop-blur-sm">
            <div className="w-full h-full sm:h-auto sm:max-w-2xl rounded-none sm:rounded-lg bg-white p-6 sm:p-8 shadow-lg space-y-4 overflow-y-auto">
              <h2 className="text-lg font-semibold mb-4">Add New Shift Log</h2>

              <div className="flex flex-col sm:flex-row gap-3">
                <label className="flex flex-col text-sm w-full">
                  <span className="mb-1 font-medium">Shift Start</span>
                  <input
                    ref={addStartRef}
                    type="datetime-local"
                    className="rounded border px-3 py-2"
                    defaultValue={getEdmontonNowLocal()}
                  />
                </label>
                <label className="flex flex-col text-sm w-full">
                  <span className="mb-1 font-medium">Shift End</span>
                  <input
                    ref={addEndRef}
                    type="datetime-local"
                    className="rounded border px-3 py-2"
                    defaultValue={getEdmontonNowLocal()}
                  />
                </label>
              </div>

              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" ref={addCriticalRef} />
                Mark as critical
              </label>

              <textarea
                ref={addNoteRef}
                rows={5}
                placeholder="Enter hand‑over note…"
                className="w-full border rounded px-3 py-2 text-sm"
              />

              <div className="flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={saveNewLog}
                  className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Save
                </button>
              </div>
            </div>
          </div>,
          document.body
        )}
      <div className="mb-4 flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-purple-700">Shift&nbsp;Logs</h1>
        <button
          type="button"
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
        >
          + Add&nbsp;Log
        </button>
      </div>
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
            onClick={fetchLogs}
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
