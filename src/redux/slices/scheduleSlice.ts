import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import { Schedule, ScheduleInsert } from '@/interfaces/scheduleInterface';

/**
 * schedulesApi
 * ------------
 * RTK Query slice that handles all CRUD operations for schedules.
 * Adjust the `baseUrl`, endpoints, and types to fit your backend.
 */

// --- UpdateScheduleArgs type for PATCH payload ---
interface UpdateScheduleArgs {
  id: number;
  staffId: number;
  patch: Partial<Schedule>;
}
export const schedulesApi = createApi({
  reducerPath: 'schedulesApi',
  baseQuery: fetchBaseQuery({
    baseUrl: `${process.env.NEXT_PUBLIC_API_BASE_URL}/api/schedule-route`,
    credentials: 'include',
  }),
  tagTypes: ['Schedule'],
  endpoints: (builder) => ({
    /** GET /schedules */
    getSchedules: builder.query<Schedule[], number>({
      query: (homeId) => `/get-schedules/${homeId}`,
      providesTags: (result) =>
        Array.isArray(result)
          ? [
              ...result.map(({ id }) => ({ type: 'Schedule' as const, id })),
              { type: 'Schedule', id: 'LIST' },
            ]
          : [{ type: 'Schedule', id: 'LIST' }],
    }),

    /** POST /schedules (single or batch) */
    addSchedule: builder.mutation<
      ScheduleInsert | ScheduleInsert[],
      ScheduleInsert | ScheduleInsert[]
    >({
      query: (body) => ({
        url: '/add-schedules',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Schedule', id: 'LIST' }],
    }),

    /** PATCH /schedules/:id */
    updateSchedule: builder.mutation<Schedule, UpdateScheduleArgs>({
      query: ({ id, staffId, patch }) => ({
        url: `/update-schedule/${staffId}/${id}`,
        method: 'PATCH',
        body: patch,
      }),
      invalidatesTags: (result, error, { id }) => [
        { type: 'Schedule', id },
        { type: 'Schedule', id: 'LIST' },
      ],
    }),

    /** DELETE /schedules/:id */
    deleteSchedule: builder.mutation<{ success: boolean; id: number }, number>({
      query: (id) => ({
        url: `/schedules/${id}`,
        method: 'DELETE',
      }),
      invalidatesTags: (result, error, id) => [
        { type: 'Schedule', id },
        { type: 'Schedule', id: 'LIST' },
      ],
    }),
  }),
});

// Auto-generated hooks
export const {
  useGetSchedulesQuery,
  useAddScheduleMutation,
  useUpdateScheduleMutation,
  useDeleteScheduleMutation,
} = schedulesApi;
