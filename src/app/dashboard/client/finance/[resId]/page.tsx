'use client';
import { useParams } from 'next/navigation';
import { useEffect, useState, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toast } from 'sonner';
import { CashAllowanceInsert } from '@/interfaces/cashTransactionInterface';

/* ---------- Types for finance summary ---------- */
export interface Transaction {
  id: number;
  amount_cents: number;
  reason: string;
  entered_by: number;
  staffFirstName: string;
  staffLastName: string;
  created_at: string; // ISO string, MDT/MST
}

export interface CashCount {
  id: number;
  balance_cents: number;
  counted_at: string;
  staff_id: number;
  staffFirstName: string;
  staffLastName: string;
  is_mismatch: boolean;
  diff_cents: number;
}

export interface Allowance {
  id: number;
  resident_id: number;
  period_start: string;
  period_end: string | null;
  amount_cents: number;
  created_at: string;
}

export interface Resident {
  id: number;
  firstName: string;
  lastName: string;
  groupHomeId: number;
}

export interface ResidentFinanceSummary {
  resident: Resident;
  latestCashCount: CashCount | null;
  runningBalance_cents: number;
  openAllowance: Allowance | null;
  transactions: Transaction[];
}

export interface CashTransactionInsert {
  resident_id: number;
  amount_cents: number;
  reason?: string | null;
  entered_by: number;
  allowance_id?: number | null;
}

/* ---------- helpers ---------- */
const fmtCurrency = (cents: number) =>
  (cents / 100).toLocaleString('en-CA', {
    style: 'currency',
    currency: 'CAD',
    minimumFractionDigits: 2,
  });

const fmtDate = (iso: string) =>
  new Date(iso).toLocaleString('en-CA', {
    timeZone: 'America/Edmonton',
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });

export default function Page() {
  const { resId } = useParams();
  const currentStaffId = useSelector((state: RootState) => state.user.userInfo.staffId);
  const router = useRouter();
  const [summary, setSummary] = useState<ResidentFinanceSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [showTxnModal, setShowTxnModal] = useState(false);
  const [showAllowanceModal, setShowAllowanceModal] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const amountRef = useRef<HTMLInputElement>(null);
  const reasonRef = useRef<HTMLTextAreaElement>(null);
  const allowanceAmountRef = useRef<HTMLInputElement>(null);
  const periodStartRef = useRef<HTMLInputElement>(null);

  const fetchSummary = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/finance/client-financial-summary/${resId}`,
        { method: 'GET', credentials: 'include' }
      );
      if (res.ok) {
        const data: ResidentFinanceSummary = await res.json();
        setSummary(data);
      } else {
        console.error(await res.text());
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error(e);
    } finally {
      setLoading(false);
    }
  }, [resId]);

  useEffect(() => {
    fetchSummary();
  }, [fetchSummary]);

  const handleAddTransaction = async (data: CashTransactionInsert) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/finance/cash-transaction`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      if (res.ok) {
        toast('Transaction added successfully', {
          style: { backgroundColor: 'green', color: 'white' },
        });
        await fetchSummary();
        return;
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error(e);
      toast('Could not add transaction', { style: { backgroundColor: 'red', color: 'white' } });
    }
  };

  const handleAddAllowance = async (data: CashAllowanceInsert) => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/finance/add-allowance/${currentStaffId}`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      if (res.ok) {
        toast('Allowance added successfully', {
          style: { backgroundColor: 'green', color: 'white' },
        });
        await fetchSummary();
        return;
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error(e);
      toast('Could not add Allowance', { style: { backgroundColor: 'red', color: 'white' } });
    }
    console.log(data);
  };

  const generatePdf = async (resident_id: number) => {
    setPdfLoading(true);
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/finance/transaction-pdf/${resident_id}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );

      if (res.ok) {
        const blob = await res.blob();
        const url = window.URL.createObjectURL(blob);

        // Open in a new browser tab/window
        window.open(url, '_blank', 'noopener,noreferrer');

        toast('PDF opened in new tab', {
          style: { backgroundColor: 'green', color: 'white' },
        });
        setPdfLoading(false);
        // Optional: revoke after some delay to give the browser time
        setTimeout(() => window.URL.revokeObjectURL(url), 10_000);
      } else {
        toast('Could not generate PDF', {
          style: { backgroundColor: 'red', color: 'white' },
        });
        setPdfLoading(false);
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error(e);
      toast('Could not generate PDF', {
        style: { backgroundColor: 'red', color: 'white' },
      });
      setPdfLoading(false);
    }
  };
  return (
    <section className="mx-auto max-w-5xl px-6 py-8 space-y-8 min-h-screen bg-gray-50">
      {/* Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <button
          type="button"
          onClick={() => router.back()}
          className="inline-flex items-center gap-1 rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm text-gray-700 shadow-sm hover:bg-gray-100"
        >
          ← Back
        </button>

        <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setShowTxnModal(true)}
            className="w-full sm:w-auto text-center inline-flex items-center gap-1 rounded-md bg-purple-600 px-4 py-1.5 text-sm font-medium text-white shadow hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
          >
            + Record&nbsp;Transaction
          </button>

          <button
            type="button"
            onClick={() => setShowAllowanceModal(true)}
            className="w-full sm:w-auto text-center inline-flex items-center gap-1 rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white shadow hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-400"
          >
            + Add&nbsp;Allowance
          </button>

          <button
            type="button"
            disabled={pdfLoading}
            onClick={() => summary && generatePdf(summary.resident.id)}
            className={
              'w-full sm:w-auto text-center inline-flex items-center justify-center gap-2 rounded-md px-4 py-1.5 text-sm font-medium shadow ' +
              (pdfLoading
                ? 'cursor-not-allowed bg-slate-400 text-white'
                : 'bg-slate-600 text-white hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-400')
            }
          >
            {pdfLoading ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <circle cx="12" cy="12" r="10" opacity="0.25" />
                  <path d="M22 12a10 10 0 0 1-10 10" strokeLinecap="round" opacity="0.75" />
                </svg>
                Exporting…
              </>
            ) : (
              '🖨️ Export PDF'
            )}
          </button>
        </div>
      </div>

      {loading ? (
        <p className="text-gray-500">Loading&hellip;</p>
      ) : summary ? (
        <>
          {/* Resident header */}
          <header className="space-y-1 border-b border-gray-200 pb-4">
            <h1 className="text-2xl font-bold">
              {summary.resident.firstName} {summary.resident.lastName}
            </h1>
            <p className="text-sm text-gray-600">Group Home&nbsp;#{summary.resident.groupHomeId}</p>
          </header>

          {/* Current balance & latest count */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-md">
              <h2 className="text-lg font-semibold mb-1">Current Balance</h2>
              <p className="text-2xl font-bold text-green-700">
                {fmtCurrency(summary.runningBalance_cents)}
              </p>
            </div>

            {summary.latestCashCount && (
              <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-md">
                <h2 className="text-lg font-semibold mb-1">Latest Cash Count</h2>
                <p className="text-xl font-medium">
                  {fmtCurrency(summary.latestCashCount.balance_cents)}
                </p>
                <p className="text-xs text-gray-600">
                  {fmtDate(summary.latestCashCount.counted_at)} &mdash;{' '}
                  {summary.latestCashCount.staffFirstName} {summary.latestCashCount.staffLastName}
                </p>
                {summary.latestCashCount.is_mismatch && (
                  <p className="mt-1 text-sm text-red-600">
                    ⚠️ Discrepancy: {fmtCurrency(summary.latestCashCount.diff_cents)}
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Allowance card */}
          {summary.openAllowance && (
            <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-md">
              <h2 className="text-lg font-semibold mb-1">Open Allowance</h2>
              <p>{fmtCurrency(summary.openAllowance.amount_cents)}</p>
              <p className="text-xs text-gray-600">
                {summary.openAllowance.period_start.slice(0, 10)} &ndash;{' '}
                {summary.openAllowance.period_end
                  ? summary.openAllowance.period_end.slice(0, 10)
                  : 'Present'}
              </p>
            </div>
          )}

          {/* Transactions table */}
          <div className="overflow-x-auto">
            {summary.transactions.length === 0 ? (
              <p className="text-sm text-gray-500">No transactions this month.</p>
            ) : (
              <div className="relative overflow-x-auto rounded-lg shadow-md">
                <table className="w-full text-sm text-left text-gray-700">
                  <thead className="text-xs uppercase tracking-wide text-gray-600 bg-gray-100 sticky top-0">
                    <tr>
                      <th scope="col" className="px-4 py-3">
                        Date&nbsp;/&nbsp;Time
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Reason
                      </th>
                      <th scope="col" className="px-4 py-3 text-right">
                        Amount
                      </th>
                      <th scope="col" className="px-4 py-3">
                        Staff
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200 bg-white">
                    {summary.transactions.map((tx) => (
                      <tr key={tx.id} className="hover:bg-purple-50">
                        <td className="px-4 py-2 whitespace-nowrap">{fmtDate(tx.created_at)}</td>
                        <td className="px-4 py-2">{tx.reason}</td>
                        <td className="px-4 py-2 text-right">
                          <span
                            className={
                              (tx.amount_cents < 0
                                ? 'bg-red-50 text-red-700'
                                : 'bg-green-50 text-green-700') +
                              ' inline-block rounded-md px-2 py-0.5 font-mono'
                            }
                          >
                            {fmtCurrency(tx.amount_cents)}
                          </span>
                        </td>
                        <td className="px-4 py-2 whitespace-nowrap">
                          {tx.staffFirstName} {tx.staffLastName}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      ) : (
        <p className="text-red-600">Unable to load finance summary.</p>
      )}

      {/* Transaction Modal */}
      {showTxnModal && summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg space-y-4">
            <h2 className="text-lg font-semibold">Record Transaction</h2>

            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const dollars = parseFloat(amountRef.current?.value || '0');
                if (isNaN(dollars) || dollars === 0) {
                  alert('Enter a non‑zero amount.');
                  return;
                }
                const cents = Math.round(dollars * 100);
                const payload: CashTransactionInsert = {
                  resident_id: summary.resident.id,
                  amount_cents: -Math.abs(cents), // store withdrawals as negative
                  reason: reasonRef.current?.value || null,
                  entered_by: currentStaffId,
                  allowance_id: summary.openAllowance?.id ?? null,
                };
                handleAddTransaction(payload);
                setShowTxnModal(false);
              }}
            >
              <label className="flex flex-col text-sm">
                <span className="mb-1 font-medium">Amount (CAD $)</span>
                <input
                  ref={amountRef}
                  type="number"
                  step="0.01"
                  min="-1000000"
                  className="rounded border px-3 py-2"
                  placeholder="0.00"
                  required
                />
              </label>

              <label className="flex flex-col text-sm">
                <span className="mb-1 font-medium">Reason (optional)</span>
                <textarea
                  ref={reasonRef}
                  rows={3}
                  className="rounded border px-3 py-2"
                  placeholder="Describe purpose…"
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTxnModal(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-purple-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-purple-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Allowance Modal */}
      {showAllowanceModal && summary && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg space-y-4">
            <h2 className="text-lg font-semibold">Add Allowance</h2>

            <form
              className="space-y-3"
              onSubmit={(e) => {
                e.preventDefault();
                const dollars = parseFloat(allowanceAmountRef.current?.value || '0');
                if (isNaN(dollars) || dollars <= 0) {
                  alert('Enter a positive amount.');
                  return;
                }
                const cents = Math.round(dollars * 100);
                const start = periodStartRef.current?.value;
                if (!start) {
                  alert('Pick a period start date');
                  return;
                }

                const allowance: CashAllowanceInsert = {
                  resident_id: summary.resident.id,
                  period_start: start,
                  amount_cents: cents,
                };
                handleAddAllowance(allowance);
                setShowAllowanceModal(false);
              }}
            >
              <label className="flex flex-col text-sm">
                <span className="mb-1 font-medium">Amount (CAD $)</span>
                <input
                  ref={allowanceAmountRef}
                  type="number"
                  step="0.01"
                  min="0"
                  className="rounded border px-3 py-2"
                  placeholder="0.00"
                  required
                />
              </label>

              <label className="flex flex-col text-sm">
                <span className="mb-1 font-medium">Period Start</span>
                <input
                  ref={periodStartRef}
                  type="date"
                  className="rounded border px-3 py-2"
                  required
                  defaultValue={new Date().toISOString().slice(0, 10)}
                />
              </label>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAllowanceModal(false)}
                  className="rounded-md border border-gray-300 bg-white px-4 py-1.5 text-sm hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-emerald-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-emerald-700"
                >
                  Save
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </section>
  );
}
