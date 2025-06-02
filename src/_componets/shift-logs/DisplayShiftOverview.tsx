'use client';
import FinanceHandler from '@/_componets/shift-logs/FinanceHandler';
import ShiftLogHandler from '@/_componets/shift-logs/ShiftLogHandler';
import { CashCountFetch } from '@/interfaces/cashTransactionInterface';
import { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

interface ResidentCashCount {
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

  //fetch cash counts for clients in a home
  useEffect(() => {
    const getCounts = async () => {
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
    };
    getCounts();
  }, [homeId]);
  return (
    <div>
      <FinanceHandler resData={counts} />

      {/* fancy separator */}
      <div className="my-8 h-px w-full bg-gradient-to-r from-purple-400 via-transparent to-purple-400" />

      <ShiftLogHandler />
    </div>
  );
}
