'use client';
import { useMemo, useState } from 'react';
import { CashCountFetch } from '@/interfaces/cashTransactionInterface';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

/* --------------------------------------------------------------------- */
/** Flattened form returned by the “month” SQL (no nested latest_count) */
interface FlattenCashCount {
  balance_cents: number;
  diff_cents: number | null;
  is_mismatch: boolean;
  staff_id: number;
  counted_at: string; // ISO string from DB
}

/** Incoming row may be either nested or flattened */
type IncomingRow = ResidentCashCount | (Omit<ResidentCashCount, 'latest_count'> & FlattenCashCount);

function hasNestedCount(row: IncomingRow): row is ResidentCashCount {
  return 'latest_count' in row;
}

/* --------------------------------------------------------------------- */
export type FinanceStatus = 'ok' | 'missing-count' | 'mismatch';

/** Payload sent when staff records a new cash‑count */
export interface NewCountPayload {
  resident_id: number;
  balance_cents: number;
  staff_id: number;
  counted_at: string; // ISO string (UTC) – always “now” in Edmonton local time
}

interface ResidentCashCount {
  resident_id: number;
  firstName: string;
  lastName: string;
  staffFirstName: string;
  staffLastName: string;
  latest_count: CashCountFetch | null;
}

export interface FinanceRow {
  id: number; // resident_id
  clientName: string; // first + last
  balance: number; // latest_count.balance_cents (0 if null)
  staffInitials: string; // first char of staffFirstName + staffLastName
  lastCount?: number; // previous balance to show in “missing-count”
  status: FinanceStatus; // derived: ok | missing-count | mismatch
  message?: string;
}

interface Props {
  resData?: IncomingRow[];
  onAddCount?: (data: NewCountPayload) => void;
}

function CountCard({
  row,
  onAddCount,
  staffId,
  fmtCurrency,
  statusColor,
  cardClass,
  messageBg,
}: {
  row: FinanceRow;
  onAddCount?: (data: NewCountPayload) => void;
  staffId: number;
  fmtCurrency: (c: number) => string;
  statusColor: (s: FinanceStatus | undefined) => string;
  cardClass: (s: FinanceStatus | undefined) => string;
  messageBg: (s: FinanceStatus | undefined) => string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div>
      <div
        className={`flex items-center justify-between rounded-md px-3 py-2 shadow-sm ${cardClass(
          row.status
        )}`}
      >
        <div className="flex flex-col">
          <span className="font-medium">{row.clientName}</span>
          <span className="text-xs text-gray-500">Staff&nbsp;{row.staffInitials}</span>
        </div>

        <span
          className={
            row.balance < 0 ? 'text-red-600 font-semibold' : 'text-green-600 font-semibold'
          }
        >
          {fmtCurrency(row.balance)}
        </span>

        {row.status && (
          <span
            className={`ml-2 rounded-full px-2 py-0.5 text-xs font-medium ${statusColor(
              row.status
            )}`}
          >
            {row.status === 'ok'
              ? 'OK'
              : row.status === 'missing-count'
                ? 'Missing'
                : '⚠️ Mismatch'}
          </span>
        )}
      </div>
      {row.status === 'missing-count' && (
        <div className="flex items-center justify-between border-t pt-1 px-1 text-xs">
          <span className="text-gray-500">
            Last&nbsp;count:&nbsp;
            {row.lastCount !== undefined ? fmtCurrency(row.lastCount) : '—'}
          </span>
          <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild={true}>
              <button
                type="button"
                className="rounded bg-purple-600 px-2 py-0.5 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                Add&nbsp;my&nbsp;count
              </button>
            </DialogTrigger>

            <DialogContent>
              <DialogHeader>
                <DialogTitle>Record Cash Count</DialogTitle>
                <DialogDescription>
                  Enter the amount of cash on hand (in dollars). The time will be saved as now.
                </DialogDescription>
              </DialogHeader>

              {/* --- form --- */}
              <form
                className="mt-4 flex flex-col gap-3"
                onSubmit={(e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const dollars = (form.elements.namedItem('amount') as HTMLInputElement).value;
                  const cents = Math.round(Number(dollars) * 100);

                  if (!Number.isFinite(cents) || cents < 0) {
                    alert('Please enter a valid non‑negative number.');
                    return;
                  }

                  const countedAtISO = new Date().toISOString(); // UTC timestamp; DB uses TIMESTAMPTZ

                  const payload: NewCountPayload = {
                    resident_id: row.id,
                    balance_cents: cents,
                    staff_id: staffId,
                    counted_at: countedAtISO,
                  };
                  if (onAddCount) {
                    onAddCount(payload);
                    setOpen(false); // close dialog
                  }
                }}
              >
                <label className="flex flex-col text-sm">
                  <span className="mb-1">Cash on hand (CAD $)</span>
                  <input
                    required
                    name="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    className="rounded border px-2 py-1"
                    placeholder="0.00"
                  />
                </label>

                <button
                  type="submit"
                  className="self-end rounded bg-purple-600 px-4 py-1 text-white hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  Save
                </button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      )}
      `
      {row.message && (
        <div
          className={`mt-1 inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs font-medium shadow-inner ${messageBg(
            row.status
          )}`}
        >
          {row.status === 'mismatch' && '⚠️'}
          {row.status === 'missing-count' && '⌛'}
          {row.message}
        </div>
      )}
    </div>
  );
}

export default function FinanceHandler({ resData: incoming, onAddCount }: Props) {
  /* --- convert incoming API data into FinanceRow[] ------------------- */

  const currentUser = useSelector((state: RootState) => state.user.userInfo.staffId);
  const user = useSelector((state: RootState) => state.user.userInfo);
  const currentStaffFirstName = user.firstName;
  const currentStaffLastName = user.lastName;
  const currentInitials = (currentStaffFirstName?.[0] ?? '') + (currentStaffLastName?.[0] ?? '');

  const rows: FinanceRow[] = useMemo(() => {
    const src: IncomingRow[] = Array.isArray(incoming) ? incoming : [];

    /* ---------- build lookup: resident_id → did current user count today? ---------- */
    const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Edmonton' }); // YYYY-MM-DD
    const myCountToday = new Set<number>();

    src.forEach((r) => {
      const nested = hasNestedCount(r) ? r.latest_count : null;
      const flat = hasNestedCount(r) ? null : r;

      const countedBy = nested ? nested.staff_id : (flat?.staff_id ?? 0);

      const raw = nested ? nested.counted_at : (flat?.counted_at ?? '');
      const countedAt = raw
        ? new Date(raw).toLocaleDateString('en-CA', { timeZone: 'America/Edmonton' })
        : '';

      if (countedBy === currentUser && countedAt === todayStr) {
        myCountToday.add(r.resident_id);
      }
    });

    /* ---------- assemble rows (one missing-count max per resident) ----------------- */
    const addedMissing = new Set<number>();
    const allRows: FinanceRow[] = [];

    src.forEach((r) => {
      const nested = hasNestedCount(r) ? r.latest_count : null;
      const flat = hasNestedCount(r) ? null : r;

      const balance = nested ? nested.balance_cents : (flat?.balance_cents ?? 0);
      const diffCents = nested ? nested.diff_cents : (flat?.diff_cents ?? null);
      const mismatch = nested ? nested.is_mismatch : (flat?.is_mismatch ?? false);
      // const countedBy = nested ? nested.staff_id : (flat?.staff_id ?? 0);

      const initials = (r.staffFirstName?.[0] ?? '') + (r.staffLastName?.[0] ?? '');

      /* — add missing-count if I haven’t counted today and haven’t added one yet — */
      if (!myCountToday.has(r.resident_id) && !addedMissing.has(r.resident_id)) {
        const missingRow: FinanceRow = {
          id: r.resident_id,
          clientName: `${r.firstName}\u202F${r.lastName}`,
          balance,
          staffInitials: currentInitials,
          lastCount: balance,
          status: 'missing-count',
          message: 'No count entered by current staff today',
        };
        allRows.push(missingRow);
        addedMissing.add(r.resident_id);
      }

      /* — regular row for this specific count entry — */
      const regularStatus: FinanceStatus = mismatch ? 'mismatch' : 'ok';

      let regularMessage: string | undefined;
      if (regularStatus === 'mismatch' && diffCents != null) {
        regularMessage = `${(diffCents / 100).toLocaleString('en-CA', {
          style: 'currency',
          currency: 'CAD',
          minimumFractionDigits: 2,
        })} since last reconciliation`;
      }

      const regularRow: FinanceRow = {
        id: r.resident_id,
        clientName: `${r.firstName}\u202F${r.lastName}`,
        balance,
        staffInitials: initials,
        lastCount: balance,
        status: regularStatus,
        message: regularMessage,
      };

      allRows.push(regularRow);
    });

    return allRows;
  }, [incoming, currentUser]);

  /* --- helpers --------------------------------------------------------- */
  const fmtCurrency = (cents: number) =>
    (cents / 100).toLocaleString('en-CA', {
      style: 'currency',
      currency: 'CAD',
      minimumFractionDigits: 2,
    });

  const statusColor = (status: FinanceStatus = 'ok') => {
    switch (status) {
      case 'missing-count':
        return 'bg-yellow-100 text-yellow-700';
      case 'mismatch':
        return 'bg-red-100 text-red-700';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const messageBg = (status: FinanceStatus = 'ok') => {
    switch (status) {
      case 'mismatch':
        return 'bg-red-100 text-red-700';
      case 'missing-count':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-green-100 text-green-700';
    }
  };

  const cardClass = (status: FinanceStatus = 'ok') => {
    switch (status) {
      case 'mismatch':
        return 'border-red-400 bg-red-50 ring-2 ring-red-300';
      case 'missing-count':
        return 'border-yellow-400 bg-yellow-50';
      default:
        return 'border-gray-200 bg-white';
    }
  };

  return rows.length === 0 ? (
    <section className="w-full px-4">
      <h1 className="text-2xl font-bold text-purple-700 mb-2">Client Cash on Hand</h1>
      <p className="text-gray-500 text-sm">No cash‑count data available.</p>
    </section>
  ) : (
    <section className="w-full space-y-3 px-4">
      <h1 className="text-2xl font-bold text-purple-700 mb-2">Client Cash on Hand</h1>

      {rows.map((r) => (
        <CountCard
          key={`${r.id}-${r.status}`}
          row={r}
          onAddCount={onAddCount}
          staffId={currentUser}
          fmtCurrency={fmtCurrency}
          statusColor={statusColor}
          cardClass={cardClass}
          messageBg={messageBg}
        />
      ))}
    </section>
  );
}
