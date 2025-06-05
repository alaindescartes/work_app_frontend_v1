'use client';
//TOD:fix date mismatch causing status to appear as not counted
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import {
  useGetFinanceSummaryByHomeIdQuery,
  useGetFinanceSummaryQuery,
} from '@/redux/slices/financeSlice';

export type FinanceReminderProps = {
  residentId: number;
};

export default function FinanceReminder({ residentId }: FinanceReminderProps) {
  /* -------------- data & current staff ----------------------- */
  const { data, isLoading, error } = useGetFinanceSummaryQuery(residentId, {
    /* auto‑refresh when tab gains focus, or every 60 s */
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    pollingInterval: 30_000,
  });
  const currentStaffId = useSelector((s: RootState) => s.user.userInfo.staffId);
  const currentHomeId = useSelector((s: RootState) => s.grouphome.grouphomeInfo.id);
  const { data: homeCounts } = useGetFinanceSummaryByHomeIdQuery(currentHomeId, {
    /* auto‑refresh when tab gains focus, or every 60 s */
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    pollingInterval: 30_000,
  });

  /* -------------- render states ------------------------------ */
  if (isLoading) return <p className="text-sm text-gray-500">Loading…</p>;
  if (error || !data) return <p className="text-sm text-red-600">Could not load finance.</p>;

  const { latestCashCount } = data;
  /* Determine if the current staff has already counted this resident today */
  const isToday = (iso: string) =>
    new Date(iso).toLocaleDateString('en-CA', { timeZone: 'America/Edmonton' }) ===
    new Date().toLocaleDateString('en-CA', { timeZone: 'America/Edmonton' });

  const countsArray = Array.isArray(homeCounts) ? homeCounts : [];

  const countedByCurrent = countsArray.some(
    (c) =>
      c.resident_id === residentId &&
      c.latest_count?.staff_id === currentStaffId &&
      c.latest_count?.counted_at &&
      isToday(c.latest_count.counted_at)
  );

  /* -------------- UI ----------------------------------------- */
  return (
    <div className="flex items-center justify-between rounded border p-3 shadow-sm">
      <div className="flex flex-col">
        <span className="font-semibold">
          Cash&nbsp;on&nbsp;Hand:{' '}
          {latestCashCount ? `$${(latestCashCount.balance_cents / 100).toFixed(2)}` : '—'}
        </span>
        {latestCashCount && (
          <span className="text-xs text-gray-500">
            Counted by {latestCashCount.staffFirstName} {latestCashCount.staffLastName}
          </span>
        )}
      </div>

      {countedByCurrent ? (
        <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs text-white">Done</span>
      ) : (
        <Link
          href={`/dashboard/group-homes/${currentHomeId}?tab=logs`}
          className="rounded bg-rose-500 px-2 py-0.5 text-xs font-medium text-white hover:bg-rose-600"
        >
          Not&nbsp;done&nbsp;– Count&nbsp;now
        </Link>
      )}
    </div>
  );
}
