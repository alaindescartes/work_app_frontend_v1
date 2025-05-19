'use client';
import React from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '@/redux/store';

function Page() {
  const staff = useSelector((state: RootState) => state.user.userInfo);

  return (
    <main className="p-8 space-y-10 text-gray-800 bg-gradient-to-br from-blue-50 to-indigo-100 min-h-screen">
      <header className="mb-6">
        <h2 className="text-4xl font-extrabold text-indigo-900 tracking-tight">
          Welcome back, {staff.firstName}
        </h2>
        <p className="text-base text-gray-600 mt-1">
          Here’s your personalized shift dashboard for today.
        </p>
      </header>

      {/* Shift Info */}
      <section className="bg-white rounded-2xl shadow-md p-6 border-l-4 border-indigo-500">
        <h3 className="text-2xl font-semibold text-indigo-800 mb-4">Today’s Shift</h3>
        <div className="space-y-2 text-sm">
          <p>
            <span className="font-medium text-gray-700">Shift Time:</span> 8:00 AM – 4:00 PM
          </p>
          <p>
            <span className="font-medium text-gray-700">Clock-In Status:</span> Clocked In
          </p>
          <p>
            <span className="font-medium text-gray-700">Break Schedule:</span> 12:00 PM – 12:30 PM
          </p>
        </div>
      </section>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Group Home */}
        <Card title="My Group Home">
          <Info label="Location" value="Sunrise Home" />
          <Info label="Shift Lead" value="Susan Clarke" />
          <Info label="Current Clients" value="4" />
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

        {/* Training Modules */}
        <Card title="Training Modules" className="md:col-span-2">
          <ul className="list-disc pl-5 text-sm space-y-1 text-gray-700">
            <li>Medication Administration — Due: April 2</li>
            <li>Positive Behavior Support — In Progress</li>
            <li>Fire Safety — Completed</li>
          </ul>
        </Card>

        {/* Emergency Contacts */}
        <Card title="Emergency Contacts">
          <Info label="Program Manager" value="David Hunt" />
          <Info label="Phone" value="(555) 234-1234" />
          <Info label="Email" value="david.hunt@example.com" />
        </Card>

        {/* Support Tickets */}
        <Card title="Support Tickets">
          <p className="text-sm text-gray-700 mb-2">
            You have <strong>1</strong> open ticket:
          </p>
          <ul className="list-disc pl-5 text-sm text-gray-700">
            <li>Portal access issue – Submitted March 20</li>
          </ul>
          <button className="mt-4 text-indigo-600 text-sm font-medium hover:underline transition">
            View All Tickets
          </button>
        </Card>

        {/* Clients Overview */}
        <Card title="Clients Overview">
          <ul className="text-sm text-gray-700 space-y-2">
            <li>
              <strong>Donald:</strong> Allergic to peanuts
            </li>
            <li>
              <strong>Elaine:</strong> Prefers quiet mornings
            </li>
            <li>
              <strong>Marcel:</strong> Mobility support needed
            </li>
          </ul>
        </Card>

        {/* Quick Actions */}
        <Card title="Quick Actions" className="flex flex-col gap-3">
          <ActionButton label="Submit Incident Report" />
          <ActionButton label="Clock In / Out" />
          <ActionButton label="View Schedule" />
          <ActionButton label="Submit Timesheet" />
        </Card>
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
  <div className={`bg-white rounded-2xl shadow-md p-6 border border-gray-200 ${className}`}>
    <h3 className="text-xl font-semibold text-indigo-800 mb-4 border-b pb-2">{title}</h3>
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

export default Page;
