import { ResidentFinanceSummary } from '@/app/dashboard/client/finance/[resId]/page';
import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { ResidentCashCount } from '@/_componets/shift-logs/DisplayShiftOverview';

export const financeApi = createApi({
  reducerPath: 'financeApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/finance`,
    credentials: 'include',
  }),
  tagTypes: ['finance'],
  endpoints: (builder) => ({
    /** GET /financial Summary */
    GetFinanceSummary: builder.query<ResidentFinanceSummary, number>({
      query: (resident_id) => `/client-financial-summary/${resident_id}`,
      providesTags: (_result, _error, resident_id) => [{ type: 'finance', id: resident_id }],
      // transformResponse can be added later if the API shape changes
    }),
    GetFinanceSummaryByHomeId: builder.query<ResidentCashCount[], number>({
      query: (home_id) =>
        `/get-cashCount-by-home/${home_id}?date=${new Date().toLocaleDateString('en-CA', {
          timeZone: 'America/Edmonton',
        })}`,
      transformResponse: (response: { counts: ResidentCashCount[] }) => response.counts,
      providesTags: (_result, _error, home_id) => [{ type: 'finance', id: home_id }],
    }),
  }),
});

// Auto-generated hooks
export const { useGetFinanceSummaryQuery, useGetFinanceSummaryByHomeIdQuery } = financeApi;
