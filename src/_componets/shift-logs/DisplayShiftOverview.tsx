'use client';
import FinanceHandler, { NewCountPayload } from '@/_componets/shift-logs/FinanceHandler';
import ShiftLogHandler from '@/_componets/shift-logs/ShiftLogHandler';
import { CashCountFetch } from '@/interfaces/cashTransactionInterface';
import { useEffect, useState, useCallback } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';
import { toast } from 'sonner';

export interface ResidentCashCount {
  resident_id: number;
  firstName: string;
  lastName: string;
  staffFirstName: string;
  staffLastName: string;
  latest_count: CashCountFetch | null;
}

export default function DisplayShiftOverview() {
  const [counts, setCounts] = useState<ResidentCashCount[]>([]);
  const homeId = useSelector((state: RootState) => state.grouphome.grouphomeInfo.id);
  const DISPLAYED_NUMBER_COUNT = 5;

  const fetchCounts = useCallback(async () => {
    try {
      const res = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/finance/get-cashCount-by-home/${homeId}?date=${new Date().toLocaleDateString('en-CA', { timeZone: 'America/Edmonton' })}`,
        {
          method: 'GET',
          credentials: 'include',
        }
      );
      if (res.ok) {
        const json = await res.json();
        const list: ResidentCashCount[] = Array.isArray(json) ? json : (json?.counts ?? []);
        setCounts(list);
      }
    } catch (e: unknown) {
      if (process.env.NODE_ENV === 'development') console.error(e);
    }
  }, [homeId]);

  useEffect(() => {
    fetchCounts();
  }, [fetchCounts]);

  //add count done by staff
  const handleAddCount = async (data: NewCountPayload) => {
    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/finance/add-cashCount`,
        {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(data),
        }
      );
      if (response.ok) {
        toast('counts added successfully.', {
          style: { backgroundColor: 'green', color: 'white' },
        });

        await fetchCounts(); // refresh list with latest data
      }
    } catch (e) {
      if (process.env.NODE_ENV === 'development') console.error(e);
      toast("couldn't add count added successfully.", {
        style: { backgroundColor: 'red', color: 'white' },
      });
    }
  };
  return (
    <div>
      <FinanceHandler
        resData={counts}
        onAddCount={handleAddCount}
        maxRegularRows={DISPLAYED_NUMBER_COUNT}
      />

      {/* fancy separator */}
      <div className="my-8 h-px w-full bg-gradient-to-r from-purple-400 via-transparent to-purple-400" />

      <ShiftLogHandler />
    </div>
  );
}
