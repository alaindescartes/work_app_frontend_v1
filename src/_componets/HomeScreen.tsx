'use client';
import React, { useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState } from '@/redux/store';
import FinanceReminder from '@/_componets/addons/HomeScreen/FinanceReminder';
import Link from 'next/link';
import ScheduleHome from '@/_componets/addons/HomeScreen/ScheduleHome';
import { Button } from '@/components/ui/button';
import { clearSavedHome } from '@/lib/saveHomeToLocalStorage';
import Overlay from '@/_componets/addons/Overlay';
import CustomizeHome from '@/_componets/addons/CustomizeHome';
import { resetGrouphomeInfo, setGroupHomeClients } from '@/redux/slices/groupHomeSlice';

function HomeScreen() {
  const staff = useSelector((state: RootState) => state.user.userInfo);
  const currentHome = useSelector((state: RootState) => state.grouphome.grouphomeInfo);
  const residents = useSelector((state: RootState) => state.grouphome.residents);
  const [isSelectingHome, setisSelectingHome] = useState<boolean>(false);
  const dispatch = useDispatch();

  if (isSelectingHome) {
    return (
      <Overlay brightness={0.8}>
        <CustomizeHome />
      </Overlay>
    );
  }

  return (
    <main className="p-4 md:p-8 space-y-8 md:space-y-10 text-gray-800 bg-gray-100 min-h-screen">
      <header className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        {/* Greeting */}
        <div>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-indigo-900 tracking-tight">
            Welcome back, {staff.firstName}
          </h2>
          <p className="mt-1 text-base text-gray-600">
            Here’s your personalized shift dashboard for today.
          </p>
        </div>

        {/* Change‑home button */}
        <Button
          className="ml-auto w-full sm:w-auto inline-flex items-center justify-center rounded-md bg-purple-600 px-4 py-2 text-sm font-semibold text-white shadow transition hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-purple-400"
          onClick={() => {
            clearSavedHome(staff.staffId);
            dispatch(resetGrouphomeInfo());
            dispatch(setGroupHomeClients([]));
            setisSelectingHome(true);
          }}
        >
          Change&nbsp;Home
        </Button>
      </header>

      {/* ────────────────── Shift Snapshot ────────────────── */}
      <section className="rounded-3xl border border-indigo-200 bg-white/80 px-6 md:px-8 py-6 md:py-8 shadow-xl ring-1 ring-indigo-50 backdrop-blur-md overflow-x-auto">
        {/* Header */}
        <header className="mb-6 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
          <h3 className="text-xl sm:text-2xl font-extrabold text-indigo-800 flex items-center gap-2">
            <span className="inline-block h-3 w-3 rounded-full bg-emerald-500 animate-pulse" />
            Shift&nbsp;Snapshot&nbsp;&mdash;&nbsp;{currentHome.name}
          </h3>
          <p className="text-sm text-gray-600">Start strong&mdash;run through these essentials.</p>
        </header>

        {/* Finance checklist */}
        <div className="mb-6">
          <h4 className="mb-2 text-xs sm:text-sm font-semibold text-indigo-700">Cash Counts</h4>
          <div className="space-y-2">
            {residents.map((r) => (
              <FinanceReminder residentId={r.id} key={r.id} />
            ))}
          </div>
        </div>

        {/* Shift log CTA */}
        <div className="mb-6 flex flex-wrap items-center gap-2 rounded-lg bg-indigo-50/60 p-4">
          <span className="text-sm text-gray-700">
            Stay in sync&mdash;review your colleagues’ notes:
          </span>
          <Link
            href={`/dashboard/group-homes/${currentHome.id}?tab=logs`}
            className="inline-block rounded-md bg-indigo-600 px-3 py-1.5 text-xs font-medium text-white shadow-sm transition hover:bg-indigo-700"
          >
            Open&nbsp;Shift&nbsp;Logs
          </Link>
        </div>

        {/* Upcoming schedules */}
        <div>
          <h4 className="mb-2 text-xs sm:text-sm font-semibold text-indigo-700">
            Upcoming Client Schedules
          </h4>
          <div className="space-y-2 max-h-96 overflow-y-auto pr-1">
            {residents.map((r) => (
              <ScheduleHome
                resident_id={r.id}
                resident_fNma={r.firstName}
                resident_lName={r.lastName}
                key={r.id}
              />
            ))}
          </div>
        </div>
      </section>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
        {/* Group Home */}
        <Card title="My Group Home">
          <Info label="Location" value={currentHome.address} />
          <Info label="Shift Lead" value={currentHome.managerName ? currentHome.managerName : ''} />
          <Info
            label="Current Clients"
            value={residents.length ? residents.length.toString() : ''}
          />
        </Card>

        {/* Pending Tasks */}
        <Card title="Pending Tasks">
          <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
            <li>Complete incident report for Client A</li>
            <li>Review March policies</li>
            <li>Update timesheet for this week</li>
          </ul>
        </Card>

        {/* Announcements */}
        <Card title="Announcements">
          <ul className="text-sm text-gray-700 space-y-1">
            <li>Fire drill scheduled for March 29 at 3 PM</li>
            <li>New transportation protocol effective next week</li>
          </ul>
        </Card>

        {/* Emergency Contacts */}
        <Card title="Emergency Contacts">
          <Info label="Program Manager" value="David Hunt" />
          <Info label="On‑Call Supervisor" value="(555) 111‑2222" />

          {/* Critical numbers */}
          <Info label="Police / Fire (Non‑Emergency)" value="(555) 311‑0000" />
          <Info label="Poison Control" value="1‑800‑222‑1222" />
          <Info label="24‑Hour Nurse Line" value="(555) 987‑6543" />

          {/* General office */}
          <Info label="Office Phone" value="(555) 234‑1234" />
          <Info label="Office Email" value="david.hunt@example.com" />
        </Card>

        {/*/!* Quick Actions *!/*/}
        {/*<Card title="Quick Actions" className="flex flex-col gap-3">*/}
        {/*  <ActionButton label="Submit Incident Report" />*/}
        {/*  <ActionButton label="Clock In / Out" />*/}
        {/*  <ActionButton label="View Schedule" />*/}
        {/*  <ActionButton label="Submit Timesheet" />*/}
        {/*</Card>*/}
      </div>
    </main>
  );
}

const Card = ({
  title,
  children,
  className = '',
}: {
  title: string;
  children: React.ReactNode;
  className?: string;
}) => (
  <div
    className={`
      relative overflow-hidden rounded-3xl bg-white/90 p-4 md:p-6 shadow-lg ring-1 ring-indigo-50
      transition hover:shadow-xl
      ${className}
    `}
  >
    {/* Decorative gradient strip */}
    <span className="pointer-events-none absolute inset-x-0 top-0 h-1 block bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

    <h3 className="mb-4 border-b border-indigo-100 pb-3 text-xl font-bold text-indigo-800">
      {title}
    </h3>
    {children}
  </div>
);

const Info = ({ label, value }: { label: string; value: string }) => (
  <p className="text-sm text-gray-700">
    <span className="font-medium">{label}:</span> {value}
  </p>
);

const ActionButton = ({ label }: { label: string }) => (
  <button className="bg-indigo-600 text-white py-2 rounded-md text-sm font-medium hover:bg-indigo-700 transition">
    {label}
  </button>
);

export default HomeScreen;
