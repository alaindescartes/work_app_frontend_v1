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
  const currentStaffId = useSelector((s: RootState) => s.user.userInfo.staffId);
  const currentHomeId = useSelector((s: RootState) => s.grouphome.grouphomeInfo.id);
  const { data: homeCounts } = useGetFinanceSummaryByHomeIdQuery(currentHomeId, {
    /* auto‑refresh when tab gains focus, or every 60 s */
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    pollingInterval: 30_000,
  });
  const { data: summary } = useGetFinanceSummaryQuery(residentId, {
    /* auto‑refresh when tab gains focus, or every 60 s */
    refetchOnMountOrArgChange: true,
    refetchOnFocus: true,
    pollingInterval: 30_000,
  });

  /* -------------- render states ------------------------------ */
  if (!homeCounts) return <p className="text-sm text-gray-500">Loading…</p>;

  /* homeCounts already contains only *today’s* rows.
     Staff has counted if any entry for this resident has their staff_id. */
  const countsArray = Array.isArray(homeCounts) ? homeCounts : [];

  const countedByCurrent = countsArray.some(
    (c) => c.resident_id === residentId && c.staff_id === currentStaffId
  );

  /* -------------- last-count snapshot ------------------------ */
  const clientName = summary?.resident
    ? `${summary.resident.firstName} ${summary.resident.lastName}`
    : '—';

  const lastAmount =
    summary?.latestCashCount?.balance_cents != null
      ? `$${(summary.latestCashCount.balance_cents / 100).toFixed(2)}`
      : '—';

  const lastCountedBy = summary?.latestCashCount
    ? `${summary.latestCashCount.staffFirstName} ${summary.latestCashCount.staffLastName}`
    : '—';

  /* -------------- UI ----------------------------------------- */
  return (
    <div className="flex items-center justify-between rounded border p-3 shadow-sm">
      <div className="flex flex-col">
        <span className="text-sm font-semibold">{clientName}</span>
        <span className="text-xs text-gray-500">
          Last&nbsp;count:&nbsp;{lastAmount} by {lastCountedBy}
        </span>
      </div>

      {countedByCurrent ? (
        <span className="rounded bg-emerald-600 px-2 py-0.5 text-xs text-white">
          You already counted
        </span>
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
